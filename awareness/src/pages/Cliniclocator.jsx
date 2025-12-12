import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import '../styles/ClinicLocator.css'; 

// Mock data list for filter options (matching backend ENUMs and data)
const COUNTY_OPTIONS = ['Nairobi', 'Nakuru', 'Mombasa', 'Kisumu'];
const SERVICE_OPTIONS = ['Pap', 'Mammogram', 'PSA', 'Colonoscopy'];
const PRICE_OPTIONS = [
    { label: 'Free', value: 'FREE' },
    { label: 'KES 0 - 1,000', value: 'LOW' },
    { label: 'KES 1,001 - 5,000', value: 'MEDIUM' },
    { label: 'KES 5,000+', value: 'HIGH' },
];

const ClinicLocator = () => {
    const [clinics, setClinics] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        county: '',
        service: '',
        priceBand: '',
    });
    const [filtersVisible, setFiltersVisible] = useState(false);

    // Function to fetch clinics based on current filters
    const fetchClinics = useCallback(async () => {
        setLoading(true);
        setError(null);

        // Convert filters state into URL query parameters
        const queryParams = new URLSearchParams(filters).toString();
        const url = `/api/clinics?${queryParams}`;

        try {
            const response = await fetch(url);
            
            if (!response.ok) {
                // If backend returns a non-200 status (e.g., 404 No Clinics Found)
                if (response.status === 404) {
                    setClinics([]);
                    return; 
                }
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            setClinics(data.clinics || []);

        } catch (err) {
            console.error('Failed to fetch clinics:', err);
            setError('Could not connect to the clinic database. Please try again later.');
            setClinics([]);
        } finally {
            setLoading(false);
        }
    }, [filters]); // Dependency array ensures fetchClinics only changes if filters change

    // Fetch data on component mount and whenever filters change
    useEffect(() => {
        fetchClinics();
    }, [fetchClinics]);

    // Handler for filter changes
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const renderClinicCard = (clinic) => {
        // Splitting the availableServices string into an array for rendering tags
        const services = clinic.availableServices ? clinic.availableServices.split(',').map(s => s.trim()) : [];
        
        // Custom style for free events/low price bands
        const getPriceTagStyle = (priceBand) => {
            switch (priceBand) {
                case 'FREE': return { backgroundColor: 'var(--color-risk-low)', color: 'white' };
                case 'LOW': return { backgroundColor: '#f0f9ff', color: 'var(--color-primary)' };
                default: return {};
            }
        };

        return (
            <div key={clinic.id} className="clinic-card">
                <Link to={`/clinic/${clinic.id}`} className="book-btn">Book →</Link>
                <h3 className="clinic-name">{clinic.name}</h3>
                <div className="clinic-info">
                    <p>Location: **{clinic.county}**</p>
                    <p>Price Band: <span style={getPriceTagStyle(clinic.priceBand)}>**{clinic.priceBand}**</span></p>
                    <p>NHIF Accredited: {clinic.isNHIFAccredited ? 'Yes' : 'No'}</p>
                </div>
                <div className="clinic-services">
                    {services.map(service => (
                        <span key={service} className="service-tag">{service}</span>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="clinic-locator-page container">
            
            <header className="locator-header">
                <h1>Find Cancer Screening Centres</h1>
                <p className="text-sm text-gray-500">Search by location, service, and affordability.</p>
            </header>

            {/* --- Search & Filter Controls --- */}
            <div className="search-controls">
                
                <div className="search-controls-row">
                    {/* County Filter */}
                    <select 
                        name="county" 
                        className="select-field" 
                        value={filters.county}
                        onChange={handleFilterChange}
                    >
                        <option value="">All Counties</option>
                        {COUNTY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>

                    <button 
                        className="filter-toggle-btn" 
                        onClick={() => setFiltersVisible(!filtersVisible)}
                    >
                        {filtersVisible ? 'Hide Filters' : 'Show Filters'}
                    </button>
                </div>
                
                {/* Detailed Filters (Toggled on Mobile) */}
                <div 
                    className="detailed-filters"
                    // Simple inline style for visibility toggle, CSS media query handles desktop visibility
                    style={{ display: filtersVisible ? 'flex' : 'none' }}
                >
                    {/* Service Filter */}
                    <select 
                        name="service" 
                        className="select-field"
                        value={filters.service}
                        onChange={handleFilterChange}
                    >
                        <option value="">All Services</option>
                        {SERVICE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>

                    {/* Price Band Filter */}
                    <select 
                        name="priceBand" 
                        className="select-field"
                        value={filters.priceBand}
                        onChange={handleFilterChange}
                    >
                        <option value="">All Price Bands</option>
                        {PRICE_OPTIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                    </select>
                </div>
            </div>

            {/* --- Map and Results Area --- */}
            <div className="map-results-area">
                
                {/* Map View */}
                <div className="map-container flex-center text-gray-500">
                    {/* Map integration would go here (e.g., Leaflet or Google Maps) */}
                    [Map Placeholder: Shows clinics in filtered county]
                </div>

                {/* Clinic List */}
                <div className="clinic-list-container">
                    <h2 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1rem' }}>
                        {loading ? 'Searching...' : `${clinics.length} Clinics Found`}
                    </h2>
                    
                    {error && <p className="text-red-500">{error}</p>}

                    {!loading && clinics.length === 0 && !error && (
                        <p className="text-gray-600">No clinics matched your current filters. Try adjusting your county or service type.</p>
                    )}

                    {clinics.map(renderClinicCard)}
                </div>
            </div>
        </div>
    );
};

export default ClinicLocator;