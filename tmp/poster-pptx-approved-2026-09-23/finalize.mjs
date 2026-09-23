import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
const root='/home/xeliaray/Projects/Trends-In-ML-2';
const build=path.join(root,'tmp/poster-pptx-approved-2026-09-23');
const skill='/home/xeliaray/.codex/plugins/cache/openai-primary-runtime/presentations/26.915.20218/skills/presentations';
const { finalizePresentation }=await import(pathToFileURL(path.join(skill,'container_tools/artifact_tool_utils.mjs')).href);
const reference=path.join(root,'output/poster-narrative-3/revised-poster/powerpoint/legal-rag-poster-updated.pptx');
await fs.mkdir(path.join(build,'validated'),{recursive:true});
const result=await finalizePresentation({
  workspaceDir:root,
  candidatePath:path.join(build,'calibrated.pptx'),
  finalPath:path.join(build,'validated/legal-rag-poster-updated-v3.pptx'),
  pythonExecutable:'/home/xeliaray/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3',
  integrityValidatorPath:path.join(skill,'container_tools/inspect_presentation_package_integrity.py'),
  layoutValidatorPath:path.join(skill,'container_tools/inspect_presentation_layout_geometry.py'),
  layoutArgs:['--expected-slide-size-emu','21384000,30276000','--validate-bullet-geometry','--validate-heading-fit'],
  explicitTotalSlideCount:1,
  requiredNativeTableOwnerSlides:[],
  requiredNativeChartOwnerSlides:[],
  fontPolicy:{basis:'reference',families:['Noto Sans'],referencePath:reference,referenceSha256:createHash('sha256').update(await fs.readFile(reference)).digest('hex')},
  verifyArtifactToolImport:true,
  receiptPath:path.join(build,'validation-v3.json'),
});
console.log(JSON.stringify({status:result.status,finalPath:result.finalPath,receiptPath:path.join(build,'validation-v3.json')},null,2));
