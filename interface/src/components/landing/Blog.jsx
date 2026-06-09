export default function Blog() {
  return (
    <section id="blog">
      <div className="blog-header">
        <h2>Latest Blog Posts</h2>
      </div>
      <div className="blog-grid">
        <div className="blog-card">
          <div className="blog-img"><img src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=600&auto=format&fit=crop" alt="ACTIVITY" /></div>
          <div className="blog-body">
            <div className="blog-date">February 17, 2024</div>
            <h3>Three reasons why physical activity should be a routine</h3>
            <p>It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout, the point of using.</p>
            <a href="#" className="blog-read">Read More...</a>
          </div>
        </div>
        <div className="blog-card">
          <div className="blog-img"><img src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=600&auto=format&fit=crop" alt="NUTRITION" /></div>
          <div className="blog-body">
            <div className="blog-date">February 10, 2024</div>
            <h3>Fitness and nutrition tips from the healthiest countries</h3>
            <p>It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout, the point of using.</p>
            <a href="#" className="blog-read">Read More...</a>
          </div>
        </div>
        <div className="blog-card">
          <div className="blog-img"><img src="https://images.unsplash.com/photo-1472745433479-4556f22e32c2?q=80&w=600&auto=format&fit=crop" alt="KIDS FIT" /></div>
          <div className="blog-body">
            <div className="blog-date">February 2, 2024</div>
            <h3>How to get your kids moving though out summer 2024</h3>
            <p>It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout, the point of using.</p>
            <a href="#" className="blog-read">Read More...</a>
          </div>
        </div>
      </div>
      <div className="blog-dots">
        <button className="blog-dot-nav">+</button>
        <button className="blog-dot active"></button>
        <button className="blog-dot"></button>
        <button className="blog-dot"></button>
        <button className="blog-dot-nav next"><i className="ph ph-arrow-right"></i></button>
      </div>
    </section>
  );
}
