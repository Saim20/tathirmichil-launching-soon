// Create a new TestLayout.tsx in the layouts directory
import React from 'react';

const TestLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className='bg-tathir-beige min-h-screen flex flex-col items-center justify-center p-4'>
            {children}
        </div>
    );
};

export default TestLayout;