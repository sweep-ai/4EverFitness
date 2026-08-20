import LogoBar from './LogoBar.jsx';

export default function Header({ showHero = true }) {
  return (
    <>
      <LogoBar />
      {showHero ? (
        <section className="hero">
          <div className="hero-atmosphere" aria-hidden="true">
            <div className="hero-grid">
              {Array.from({ length: 24 }, (_, i) => (
                <span key={i} className={`hero-tile hero-tile-${(i % 6) + 1}`} />
              ))}
            </div>
          </div>
          <div className="hero-content">
            <h1 className="headline">
              Lose <span className="headline-metric">20+lbs</span> in <span className="headline-metric">12 weeks</span>{' '}
              without giving up your cultural foods or going to the gym.
            </h1>
            <p className="subheadline">
              Built for Hispanics working <strong>40+ hour weeks</strong>. The Tortilla Method:{' '}
              <strong>20 lbs in 90 days</strong>. Still eating arroz, frijoles, and carne asada — no equipment needed.
            </p>
          </div>
        </section>
      ) : null}
    </>
  );
}
