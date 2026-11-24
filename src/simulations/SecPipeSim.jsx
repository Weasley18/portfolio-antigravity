import { useState } from 'react';
import { SimFrame } from './SimFrame';
import PullRequestPanel from './secpipe/PullRequestPanel';
import AggregatorPanel from './secpipe/AggregatorPanel';
import DastPanel from './secpipe/DastPanel';

const tabs = [
    { id: 'pr', label: 'Open a pull request' },
    { id: 'agg', label: 'Inside the aggregator' },
    { id: 'dast', label: 'Pull the plug on DAST' },
];

export default function SecPipeSim() {
    const [tab, setTab] = useState('pr');
    return (
        <SimFrame
            title="Try to sneak a bug past the gate"
            label="REPLAY · REAL FLAWS, RULES AND RUN NUMBERS"
            tabs={tabs}
            active={tab}
            onTab={setTab}
            footer={
                <>
                    The 14 flaws, which tools catch them, and the run numbers are from the SecPipe repo; its demo pull request has stayed blocked on every rebase. The code
                    lines are short illustrations of each flaw. Source:{' '}
                    <a href="https://github.com/Weasley18/SecPipe" target="_blank" rel="noreferrer" className="font-bold text-text-primary">
                        github.com/Weasley18/SecPipe
                    </a>
                    .
                </>
            }
        >
            {tab === 'pr' && <PullRequestPanel />}
            {tab === 'agg' && <AggregatorPanel />}
            {tab === 'dast' && <DastPanel />}
        </SimFrame>
    );
}
