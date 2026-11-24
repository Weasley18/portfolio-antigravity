import { motion } from 'framer-motion';
import { experience, milestones } from '../data';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';
import { revealOnView } from '../lib/motion';
import SectionHeading from '../components/ui/SectionHeading';
import Timeline from '../components/ui/Timeline';
import ResumeButton from '../components/ui/ResumeButton';
import CareerFlight from '../components/three/CareerFlight';

const Experience = () => {
    const reduced = usePrefersReducedMotion();
    return (
        <div className="py-6 md:py-10">
            <motion.div {...revealOnView(reduced)} className="mb-6 max-w-2xl">
                <p className="font-mono text-xs uppercase tracking-widest text-accent-warm mb-4">Career mode</p>
                <h1 className="text-6xl sm:text-7xl md:text-8xl font-display font-extrabold uppercase tracking-tight leading-none mb-5">Experience</h1>
                <p className="text-lg text-text-secondary font-light">
                    From research at IIT Roorkee to shipping production APIs at Firedesk: every gate is a milestone. Scroll to fly through them,
                    or use the rail on the right to jump.
                </p>
            </motion.div>

            <CareerFlight milestones={milestones} />

            <section className="pt-16 md:pt-24">
                <SectionHeading index="02" kicker="The detail" title="Match report" />
                <Timeline items={experience} />
            </section>

            <div className="text-center pt-16">
                <ResumeButton variant="solid" />
            </div>
        </div>
    );
};

export default Experience;
