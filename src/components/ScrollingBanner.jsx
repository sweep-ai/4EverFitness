import { TRANSFORMATION_IMAGES } from '../data/transformations';

export default function ScrollingBanner() {
  const frames = [...TRANSFORMATION_IMAGES, ...TRANSFORMATION_IMAGES];

  return (
    <section className="proof-banner" aria-label="Client transformations">
      <div className="proof-track">
        {frames.map((src, index) => (
          <img
            key={`${src}-${index}`}
            src={encodeURI(src)}
            alt=""
            loading={index < 4 ? 'eager' : 'lazy'}
            decoding="async"
          />
        ))}
      </div>
    </section>
  );
}
