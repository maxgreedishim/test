import { useEffect} from 'react';
import axios from 'axios';
import Modal from "react-modal";

const CompanySelect = ({ onSelect }) => {
    useEffect(() => {
        Modal.setAppElement('#root');
    }, []);

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const response = await axios.get('https://dispex.org/api/vtest/Request/streets');
                console.log("response.data",response.data)
                onSelect(response.data);
            } catch (error) {
                console.log(error);
            }
        };
        fetchCompanies().then();
    }, []);
};

export default CompanySelect;
