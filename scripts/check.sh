#!/usr/bin/env bash
# Static checks for the essentials plugin. Run from anywhere: scripts/check.sh
# Exits non-zero on the first category with failures. Needs bash, python3, jq.

set -u
cd "$(dirname "$0")/.." || exit 1
fail=0
note() { echo "FAIL: $*"; fail=1; }

# 1. Manifests and hooks parse.
for f in .claude-plugin/plugin.json .claude-plugin/marketplace.json hooks/hooks.json; do
  jq . "$f" >/dev/null 2>&1 || note "$f is not valid JSON"
done
for f in hooks/*.sh scripts/*.sh; do
  bash -n "$f" || note "$f has a bash syntax error"
done

# 2. No legacy commands/ directory: skills won since the merge.
[ -d commands ] && note "commands/ exists; move each file to skills/<name>/SKILL.md"

# 3. Every skill and agent has valid frontmatter; skill name matches its directory;
#    agent model is a documented alias; only documented keys are used.
python3 - <<'PY' || fail=1
import re, glob, os, sys
bad = 0
def fm(path):
    s = open(path).read()
    m = re.match(r'^---\n(.*?)\n---\n', s, re.S)
    if not m:
        print(f"FAIL: {path} has no frontmatter"); return None, s
    d = {}
    for l in m.group(1).splitlines():
        if ':' in l:
            k, v = l.split(':', 1); d[k.strip()] = v.strip()
    return d, s

skill_keys = {'name','description','when_to_use','argument-hint','arguments','disable-model-invocation',
              'user-invocable','allowed-tools','disallowed-tools','model','effort','context','agent',
              'background','hooks','paths','shell','metadata','license','compatibility'}
agent_keys = {'name','description','tools','disallowedTools','model','effort','maxTurns','skills','memory',
              'background','omitClaudeMd','isolation','color','experimental'}
models = {'sonnet','opus','haiku','fable','inherit'}

skills = {}
for f in sorted(glob.glob('skills/*/SKILL.md')):
    d, s = fm(f)
    if d is None: bad += 1; continue
    name = f.split('/')[-2]; skills[name] = d
    if d.get('name') != name: print(f"FAIL: {f} name '{d.get('name')}' != dir '{name}'"); bad += 1
    if not d.get('description'): print(f"FAIL: {f} missing description"); bad += 1
    if len(d.get('description','')) + len(d.get('when_to_use','')) > 1536: print(f"FAIL: {f} description too long"); bad += 1
    extra = set(d) - skill_keys
    if extra: print(f"FAIL: {f} unknown frontmatter keys {sorted(extra)}"); bad += 1
    if 'model' in d and d['model'] not in models and not d['model'].startswith('claude-'):
        print(f"FAIL: {f} model '{d['model']}'"); bad += 1
    if s.count('\n') > 500: print(f"WARN: {f} is over 500 lines")

agents = {}
for f in sorted(glob.glob('agents/*.md')):
    d, s = fm(f)
    if d is None: bad += 1; continue
    name = os.path.basename(f)[:-3]; agents[name] = d
    if d.get('name') != name: print(f"FAIL: {f} name '{d.get('name')}' != file '{name}'"); bad += 1
    if not d.get('description'): print(f"FAIL: {f} missing description"); bad += 1
    extra = set(d) - agent_keys
    if extra: print(f"FAIL: {f} unknown frontmatter keys {sorted(extra)}"); bad += 1
    if 'model' in d and d['model'] not in models and not d['model'].startswith('claude-'):
        print(f"FAIL: {f} model '{d['model']}' is not a documented alias"); bad += 1
    if re.search(r'claude-[a-z]+-\d-\d+-\d{8}', d.get('model','')):
        print(f"FAIL: {f} pins a dated model id; use the bare alias"); bad += 1

# 4. Every essentials:<agent> reference resolves; every /<skill> reference resolves.
refs = set()
for f in glob.glob('skills/*/SKILL.md') + glob.glob('workflows/*.js') + glob.glob('agents/*.md'):
    refs |= set(re.findall(r'essentials:([a-z][a-z-]+)', open(f).read()))
for r in sorted(refs):
    if r not in agents and r not in skills: print(f"FAIL: reference essentials:{r} has no agent or skill"); bad += 1
srefs = set()
for f in glob.glob('skills/*/SKILL.md') + ['README.md']:
    srefs |= set(re.findall(r'`/([a-z][a-z-]+)(?:[ `])', open(f).read()))
for r in sorted(srefs):
    if r not in skills and r not in ('plugin',): print(f"FAIL: /{r} is referenced but no skill exists"); bad += 1

# 5. Workflows: no dated model ids, no unknown effort values.
for f in glob.glob('workflows/*.js'):
    s = open(f).read()
    for m in re.findall(r"model:\s*['\"]([^'\"]+)['\"]", s):
        if re.search(r'\d{8}', m): print(f"FAIL: {f} pins dated model {m}"); bad += 1
    for e in re.findall(r"effort:\s*['\"]([^'\"]+)['\"]", s):
        if e not in ('low','medium','high','xhigh','max'): print(f"FAIL: {f} effort '{e}'"); bad += 1

# 6. Profile schema marker agrees between first-run and the hook.
a = re.search(r'profile-schema: (\d+)', open('skills/first-run/SKILL.md').read())
b = re.search(r'profile-schema: (\d+)', open('hooks/suggest-first-run.sh').read())
if not a or not b or a.group(1) != b.group(1): print("FAIL: profile-schema marker differs between first-run and hook"); bad += 1

print(f"skills: {len(skills)}  agents: {len(agents)}  workflows: {len(glob.glob('workflows/*.js'))}")
sys.exit(1 if bad else 0)
PY

# 7. Hooks run cleanly in an empty repo and are silent with the nudge disabled.
t=$(mktemp -d); git -C "$t" init -q
out=$(cd "$t" && CLAUDE_PROJECT_DIR="$t" ESSENTIALS_NO_NUDGE=1 bash "$OLDPWD/hooks/suggest-first-run.sh")
[ -z "$out" ] || note "suggest-first-run.sh not silent with ESSENTIALS_NO_NUDGE=1"
rm -rf "$t"

if [ "$fail" -eq 0 ]; then echo "all checks passed"; else exit 1; fi
