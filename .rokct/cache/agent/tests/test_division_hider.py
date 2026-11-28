# The division hider (1.29.0): a division is listed only when a valid card
# in divisions/ names it. Runs landing/rokct-divisions.ts under node.
import json
import os
import shutil
import subprocess
import tempfile
import unittest

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "..", "templates", "components", "custom", "landing", "rokct-divisions.ts")

PROBE = """
import { visibleDivisions, parseDivisionCard } from './rokct-divisions.ts';
const card = (o) => JSON.stringify(o);
const out = {
  none: visibleDivisions([]).map((d) => d.id),
  some: visibleDivisions([
    { name: 'RokctAI__polaris-web.json', text: card({ division: 'polaris', repo: 'RokctAI/polaris-web', url: 'https://polaris-web-nu.vercel.app' }) },
    { name: 'RokctAI__Juvo-platforms.json', text: card({ division: 'juvo-platforms', repo: 'RokctAI/Juvo-platforms' }) },
    { name: 'RokctAI__x.json', text: card({ division: 'unknown', repo: 'RokctAI/x' }) },
    { name: 'wrong-name.json', text: card({ division: 'tensor', repo: 'RokctAI/tensor' }) },
    { name: 'RokctAI__bad.json', text: '{not json' },
  ]),
  badUrl: parseDivisionCard('RokctAI__a.json', card({ division: 'soma', repo: 'RokctAI/a', url: 'http://a' })),
};
console.log(JSON.stringify(out));
"""


class DivisionHider(unittest.TestCase):
    def test_only_announced_divisions_show(self):
        node = shutil.which("node")
        if not node:
            raise unittest.SkipTest("node not found")
        with tempfile.TemporaryDirectory() as tmp:
            shutil.copy(SRC, os.path.join(tmp, "rokct-divisions.ts"))
            with open(os.path.join(tmp, "probe.mts"), "w", encoding="utf-8") as f:
                f.write(PROBE)
            run = subprocess.run([node, "--experimental-strip-types", "--no-warnings", "probe.mts"],
                                 cwd=tmp, capture_output=True, text=True, timeout=60)
        self.assertEqual(run.returncode, 0, run.stderr)
        out = json.loads(run.stdout)
        self.assertEqual(out["none"], [])
        self.assertEqual([d["id"] for d in out["some"]], ["juvo-platforms", "polaris"])
        self.assertEqual(out["some"][1]["url"], "https://polaris-web-nu.vercel.app")
        self.assertNotIn("url", {k for k, v in out["some"][0].items() if v is not None})
        self.assertIsNone(out["badUrl"])


if __name__ == "__main__":
    unittest.main()
