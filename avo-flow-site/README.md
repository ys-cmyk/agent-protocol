# Avo Flow Site

A self-contained static page ("Clinical intelligence in the EHR: now agentic")
showing how Avo reads the chart, reasons over clinical knowledge, and produces
documentation. No build step — just `index.html`.

## Deploy on Vercel

1. Go to https://vercel.com/new and import the `ys-cmyk/agent-protocol` repo.
2. Set **Root Directory** to `avo-flow-site`.
3. Set **Framework Preset** to "Other" (no build command, no output directory).
4. Deploy.

Vercel deploys production from the repo's default branch. If this folder only
exists on a feature branch, either merge it to the default branch or set the
project's **Production Branch** (Project Settings → Git) to that branch.

## Deploy on Netlify

1. Go to https://app.netlify.com/start and pick the `ys-cmyk/agent-protocol` repo.
2. Set **Base directory** to `avo-flow-site` (the included `netlify.toml`
   handles the rest — no build command, publishes the folder as-is).
3. Choose the branch to deploy and click **Deploy**.

## Zero-setup alternative

Drag the `avo-flow-site` folder onto https://app.netlify.com/drop for an
instant deploy with no git connection.
