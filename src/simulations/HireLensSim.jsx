import { useState } from 'react';
import { SimFrame } from './SimFrame';
import ScreenPanel from './hirelens/ScreenPanel';
import DrillsPanel from './hirelens/DrillsPanel';
import EvalPanel from './hirelens/EvalPanel';

const tabs = [
    { id: 'screen', label: 'Screen a resume' },
    { id: 'drills', label: 'Break the pipeline' },
    { id: 'evals', label: 'Run the evals' },
];

export default function HireLensSim() {
    const [tab, setTab] = useState('screen');
    return (
        <SimFrame
            title="HireLens, step by step"
            label="SCRIPTED REPLAY · REAL PIPELINE AND EVAL RESULTS"
            tabs={tabs}
            active={tab}
            onTab={setTab}
            footer={
                <>
                    The resumes and their assessments are written for this page, following the real schema and scoring rubric. The pipeline, failure handling and
                    eval numbers come from the HireLens repo. Try the real thing at{' '}
                    <a href="https://thehirelens.netlify.app" target="_blank" rel="noreferrer" className="font-bold text-text-primary">
                        thehirelens.netlify.app
                    </a>
                    .
                </>
            }
        >
            {tab === 'screen' && <ScreenPanel />}
            {tab === 'drills' && <DrillsPanel />}
            {tab === 'evals' && <EvalPanel />}
        </SimFrame>
    );
}
