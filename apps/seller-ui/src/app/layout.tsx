import './global.css';
import Providers from './Providers';

export const metadata = {
  title: 'EComX Seller',
  description: 'Seller Ui',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
