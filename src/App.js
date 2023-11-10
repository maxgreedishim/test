import React, { useState } from 'react';
import CompanySelect from './CompanySelect';
import FlatTree from './FlatTree';


const App = () => {
  const [selectedCompany, setSelectedCompany] = useState(null);

  const handleCompanySelect = (company) => {
      console.log("selectedCompany",company)
    setSelectedCompany(company);
  };
  return (
      <div style={{ position: "relative", top: "10px", left: "10px" }}>
        <CompanySelect onSelect={handleCompanySelect} />
        {selectedCompany && (
            <FlatTree company={selectedCompany} />
        )}
      </div>
  );
};

export default App;
