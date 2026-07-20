export default function PrivacyPolicy() {
  return (
    <>
      <div className="page-head container">
        <h2>Privacy Policy</h2>
        <p>Last updated: 9 July 2026</p>
      </div>
      <div className="container" style={{ maxWidth: 760, paddingBottom: 60, lineHeight: 1.7, fontSize: 15.5 }}>
        <p style={{ marginBottom: 20 }}>Vara Traders ("we", "us", "our") operates varatraders.ie. This page explains what personal data we collect when you use our website, why we collect it, and what rights you have over it under the EU General Data Protection Regulation (GDPR).</p>

        <h3 style={{ fontSize: 19, margin: '28px 0 10px' }}>1. What we collect</h3>
        <p style={{ marginBottom: 12 }}>When you create an account, place an order, or contact us, we may collect:</p>
        <ul style={{ marginBottom: 20, paddingLeft: 20 }}>
          <li>Name, email address, and/or phone number</li>
          <li>Delivery address, county, and Eircode</li>
          <li>Order history and items purchased</li>
          <li>Messages you send us through the contact form</li>
        </ul>
        <p style={{ marginBottom: 20 }}>We do not collect payment card details directly — these are handled by our payment provider, who has their own privacy and security obligations.</p>

        <h3 style={{ fontSize: 19, margin: '28px 0 10px' }}>2. Why we collect it</h3>
        <ul style={{ marginBottom: 20, paddingLeft: 20 }}>
          <li>To process and deliver your orders</li>
          <li>To send order confirmations and delivery updates</li>
          <li>To let you view your order history if you have an account</li>
          <li>To respond to questions sent via our contact form</li>
          <li>To meet legal obligations (e.g. tax and consumer protection records)</li>
        </ul>

        <h3 style={{ fontSize: 19, margin: '28px 0 10px' }}>3. How long we keep it</h3>
        <p style={{ marginBottom: 20 }}>We keep order records for as long as needed to meet tax and consumer protection obligations under Irish law. Account data is kept while your account remains active; you can request deletion at any time (see Section 6).</p>

        <h3 style={{ fontSize: 19, margin: '28px 0 10px' }}>4. Who we share it with</h3>
        <p style={{ marginBottom: 20 }}>We do not sell your personal data. We may share limited necessary information with: delivery/courier partners (to deliver your order), payment processors (to handle transactions), and where legally required, government or tax authorities.</p>

        <h3 style={{ fontSize: 19, margin: '28px 0 10px' }}>5. Cookies</h3>
        <p style={{ marginBottom: 20 }}>Our website uses your browser's local storage to remember your shopping cart and keep you logged in — this is essential for the site to function and isn't used for advertising or tracking. We do not currently use third-party tracking or advertising cookies.</p>

        <h3 style={{ fontSize: 19, margin: '28px 0 10px' }}>6. Your rights</h3>
        <p style={{ marginBottom: 12 }}>Under GDPR, you have the right to:</p>
        <ul style={{ marginBottom: 20, paddingLeft: 20 }}>
          <li>Access the personal data we hold about you</li>
          <li>Correct inaccurate data</li>
          <li>Request deletion of your data (subject to legal retention requirements)</li>
          <li>Object to or restrict certain processing</li>
          <li>Lodge a complaint with the Irish Data Protection Commission (<a href="https://www.dataprotection.ie" style={{ color: 'var(--peacock)' }}>www.dataprotection.ie</a>)</li>
        </ul>

        <h3 style={{ fontSize: 19, margin: '28px 0 10px' }}>7. Contact us</h3>
        <p>For any privacy questions or to exercise your rights, email us at <a href="mailto:orders@varatraders.ie" style={{ color: 'var(--peacock)' }}>orders@varatraders.ie</a>.</p>
      </div>
    </>
  );
}
