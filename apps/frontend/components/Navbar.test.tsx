import { render, screen } from '@testing-library/react';
import { Navbar } from './Navbar';
import { useSession } from 'next-auth/react';

jest.mock('next-auth/react');

describe('Navbar Component', () => {
  it('renders user name when authenticated', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { name: 'John Doe' } },
      status: 'authenticated',
    });

    render(<Navbar />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });
});
