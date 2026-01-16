import { AuthProvider } from '../context/AuthContext';
import './globals.css';

export const metadata = {
  title: 'CloudVault - Your Secure Cloud Storage',
  description: 'Manage your files and folders securely with CloudVault',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
