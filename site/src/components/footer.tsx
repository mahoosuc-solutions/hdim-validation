export function Footer() {
  return (
    <footer className="site-footer" role="contentinfo">
      <div className="footer-inner">
        <div className="footer-brand">
          <span className="footer-logo">HDIM</span>
          <p className="footer-tagline">
            Real-time clinical intelligence, validated and proven.
          </p>
        </div>
        <div className="footer-links">
          <div className="footer-col">
            <h4>Platform</h4>
            <ul>
              <li><a href="#how-it-works">How It Works</a></li>
              <li><a href="#validation">Validation</a></li>
              <li><a href="#use-cases">Use Cases</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Trust</h4>
            <ul>
              <li>HIPAA Compliant</li>
              <li>WCAG 2.1 AA</li>
              <li>SOC 2 Ready</li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Connect</h4>
            <ul>
              <li><a href="#contact">Request Demo</a></li>
              <li><a href="mailto:sales@mahoosuc.solutions">Contact Us</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} HDIM Health Data Intelligence. All rights reserved.</p>
          <p className="footer-a11y-note">
            This site meets WCAG 2.1 AA accessibility standards.
          </p>
        </div>
      </div>
    </footer>
  );
}
