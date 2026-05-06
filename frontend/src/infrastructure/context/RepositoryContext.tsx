import React, { createContext, useContext, ReactNode } from 'react';
import { adminRepository } from '../api/admin.repo';
import { vendorRepository } from '../api/vendor.repo';
import { authRepository } from '../api/auth.repo';
import { userRepository } from '../api/user.repo';
import { categoryRepository } from '../api/category.repo';
import { eventRepository } from '../api/event.repo';
import { bookingRepository } from '../api/booking.repo';
import { serviceRepository } from '../api/service.repo';

const repositories = {
    adminRepository,
    vendorRepository,
    authRepository,
    userRepository,
    categoryRepository,
    eventRepository,
    bookingRepository,
    serviceRepository
};

const RepositoryContext = createContext(repositories);

export const RepositoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    return (
        <RepositoryContext.Provider value={repositories}>
            {children}
        </RepositoryContext.Provider>
    );
};

export const useRepositories = () => useContext(RepositoryContext);
