export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
      <div className="prose dark:prose-invert max-w-none">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Last Updated: April 6, 2025</p>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
          <p className="mb-4">Thank you for choosing to use our application ("App"). This Privacy Policy is designed to help you understand how we handle information when you use our App.</p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Information We Do Not Collect</h2>
          <p className="mb-4">Our App is designed with your privacy in mind. We do not collect any personal information that could be used to identify you, including but not limited to:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Names, email addresses, or physical addresses</li>
            <li>Phone numbers</li>
            <li>Device identifiers or IP addresses</li>
            <li>Location data</li>
            <li>Browsing history</li>
            <li>User-generated content</li>
          </ul>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Limited Data Collection</h2>
          <p className="mb-4">Our App operates without collecting, storing, or transmitting any personalizable user data. Any information processed by the App remains on your device and is not accessible to us or any third parties.</p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Third-Party Services</h2>
          <p className="mb-4">Our App does not integrate with third-party analytics tools, advertising networks, or other services that might collect user data.</p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
          <p className="mb-4">Since we do not collect or store any user data, there is no risk of your personal information being compromised through our App.</p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Children's Privacy</h2>
          <p className="mb-4">Our App does not collect information from anyone, including children under the age of 13.</p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Changes to This Privacy Policy</h2>
          <p className="mb-4">We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.</p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
          <p className="mb-4">If you have any questions about this Privacy Policy, please contact us at:</p>
          <p className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md inline-block">contact@pacekit.com</p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Compliance with Apple App Store Guidelines</h2>
          <p className="mb-4">This App complies with Apple's App Store Review Guidelines regarding privacy and data collection practices. As required by the App Store, we provide this privacy policy explaining our data collection practices, which in this case is that we do not collect any personalizable user data.</p>
        </section>
      </div>
    </div>
  );
}