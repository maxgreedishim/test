import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from "react-modal";

const CompanySelect = ({ onSelect }) => {
    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState('');

    useEffect(() => {
        Modal.setAppElement('#root');
    }, []);

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const response = await axios.get('https://dispex.org/api/vtest/Request/streets');
                setCompanies(response.data);
            } catch (error) {
                console.log(error);
            }
        };

        fetchCompanies().then();
    }, []);

    const handleCompanyChange = (event) => {
        const companyId = parseInt(event.target.value);
        const company = companies.find((c) => c.id === companyId);
        setSelectedCompany(company);
        onSelect(company);
    };

    return (
        <select value={selectedCompany.id} onChange={handleCompanyChange}>
            <option value="">Выберите управляющую компанию</option>
            {companies.map((company) => (
                <option key={company.id} value={company.id}>
                    {company.name}
                </option>
            ))}
        </select>
    );
};

export default CompanySelect;
