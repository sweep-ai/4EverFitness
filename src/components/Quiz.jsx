import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { trackEvent } from '../lib/sweep';

const ContactForm = lazy(() => import('./ContactForm.jsx'));

const EVENTS = {
  start: import.meta.env.VITE_EVT_QUIZ_START || 'quiz_start',
  step2: import.meta.env.VITE_EVT_STEP_2 || 'quiz_step_2',
  step3: import.meta.env.VITE_EVT_STEP_3 || 'quiz_step_3',
  step4: import.meta.env.VITE_EVT_STEP_4 || 'quiz_step_4',
  step5: import.meta.env.VITE_EVT_STEP_5 || 'quiz_step_5',
  dq: import.meta.env.VITE_EVT_DQ || 'quiz_disqualified',
};

const QUESTIONS = [
  {
    id: 'q1_hispanic',
    prompt: 'Are you Hispanic/Latino?',
    layout: 'inline',
    options: [
      { key: 'yes', label: 'Yes' },
      { key: 'no', label: 'No' },
    ],
  },
  {
    id: 'q2_work_schedule',
    prompt: 'Which best describes your work schedule?',
    options: [
      { key: 'A', label: 'hybrid/work from home, 40 hours a week, set schedule' },
      { key: 'B', label: 'sedentary job, sit at a desk majority of the day' },
      { key: 'C', label: 'schedule changes day to day/frequent traveling' },
      { key: 'D', label: 'none of the above' },
    ],
  },
  {
    id: 'q3_situation',
    prompt: 'Which best describes your current situation right now',
    options: [
      { key: 'A', label: "I've gained 30-50lbs over the past few years and I'm concerned about my health" },
      { key: 'B', label: "I eat \"healthy\" and try to workout, but my body isn't really changing" },
      { key: 'C', label: "I start strong, but can't stay consistent with diet and training" },
      { key: 'D', label: "I get busy with work/life and can't find a realistic plan that fits my schedule" },
      { key: 'E', label: "I'm just browsing/not serious about making a change right now" },
    ],
  },
  {
    id: 'q4_goal',
    prompt: 'What is your primary goal over the next 90 days?',
    options: [
      { key: 'A', label: 'Lose 30-50lbs of belly fat, get more toned, and become the healthy confident version of myself' },
      { key: 'B', label: 'Rebuild my discipline, structure, and consistency' },
      { key: 'C', label: 'Increase energy, focus, and performance at work' },
      { key: 'D', label: 'Regain my health back and add years back on to my life' },
    ],
  },
  {
    id: 'q5_commitment',
    prompt: 'How serious are you about changing your life in the next 90 days?',
    options: [
      { key: 'A', label: "I'm all in. Willing to do whatever it takes and ready to execute." },
      { key: 'B', label: "I'm serious but need structure and accountability." },
      { key: 'C', label: "I want change but I'm not sure I'm ready." },
      { key: 'D', label: 'Just exploring options and here to waste time' },
    ],
  },
];

const STEP_EVENTS = {
  1: EVENTS.start,
  2: EVENTS.step2,
  3: EVENTS.step3,
  4: EVENTS.step4,
  5: EVENTS.step5,
};

function isDisqualified(step, value) {
  if (step === 1 && value === 'no') return true;
  if (step === 3 && value === 'E') return true;
  if (step === 5 && value === 'D') return true;
  return false;
}

const CONFIRM_MS = 380;

export default function Quiz({ onQualified, onDisqualified }) {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({});
  const [selectedKey, setSelectedKey] = useState(null);
  const [leaving, setLeaving] = useState(false);
  const advanceTimer = useRef(null);

  useEffect(() => {
    return () => {
      if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
    };
  }, []);

  function handleAnswer(option) {
    if (selectedKey) return;

    const question = QUESTIONS[step - 1];
    const nextAnswers = { ...answers, [question.id]: option.key };
    setAnswers(nextAnswers);
    setSelectedKey(option.key);

    trackEvent(STEP_EVENTS[step], {
      step,
      question_id: question.id,
      answer: option.key,
    });

    advanceTimer.current = window.setTimeout(() => {
      setLeaving(true);
      advanceTimer.current = window.setTimeout(() => {
        if (isDisqualified(step, option.key)) {
          trackEvent(EVENTS.dq, {
            step,
            question_id: question.id,
            answer: option.key,
          });
          onDisqualified();
          return;
        }

        setStep(step + 1);
        setSelectedKey(null);
        setLeaving(false);
      }, 160);
    }, CONFIRM_MS);
  }

  const totalSteps = 6;
  const progress = (step / totalSteps) * 100;
  const current = QUESTIONS[step - 1];

  return (
    <section className="quiz-card">
      <h2 className="quiz-title">
        <span className="quiz-title-accent">Apply here</span> to start your transformation
      </h2>
      <div className="quiz-meta">
        <span>
          {step} / {totalSteps}
        </span>
      </div>
      <div className="progress" aria-hidden="true">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {step < 6 ? (
        <div className={`quiz-step ${leaving ? 'is-leaving' : 'is-enter'}`}>
          <p className="question">
            {current.prompt} <span className="required">*</span>
          </p>
          <div className={`options ${current.layout === 'inline' ? 'inline' : ''}`}>
            {current.options.map((option) => (
              <button
                key={`${step}-${option.key}`}
                type="button"
                className={`option${selectedKey === option.key ? ' is-selected' : ''}${selectedKey && selectedKey !== option.key ? ' is-dimmed' : ''}`}
                onClick={() => handleAnswer(option)}
                disabled={Boolean(selectedKey)}
              >
                {current.layout !== 'inline' ? <span className="option-letter">{option.key}</span> : null}
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <Suspense fallback={<p className="question">Loading application…</p>}>
          <ContactForm answers={answers} onQualified={onQualified} />
        </Suspense>
      )}
    </section>
  );
}
