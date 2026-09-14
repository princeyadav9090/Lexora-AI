/**
 * Document Generator Engine for Lexora AI
 * Guided questionnaire data mapping -> Approved clause assembly -> Draft generation
 */

export const DOCUMENT_TEMPLATES = {
  NDA: {
    id: 'NDA',
    name: 'Non-Disclosure Agreement (NDA)',
    description: 'Protect confidential information, trade secrets, and proprietary data between disclosing and receiving parties.',
    category: 'Business & Commercial',
    jurisdiction: 'India (IN)',
    questions: [
      { id: 'disclosingParty', label: 'Disclosing Party Name', type: 'text', required: true, placeholder: 'e.g. Acme Technologies Pvt Ltd' },
      { id: 'receivingParty', label: 'Receiving Party Name', type: 'text', required: true, placeholder: 'e.g. John Doe / Consulting Inc' },
      { id: 'purpose', label: 'Purpose of Disclosure', type: 'text', required: true, placeholder: 'e.g. Evaluation of software development partnership' },
      { id: 'confidentialScope', label: 'Scope of Confidential Info', type: 'select', options: ['All technical, financial and business data', 'Source code & product designs only', 'Business strategies & financial records'], required: true },
      { id: 'duration', label: 'Confidentiality Duration', type: 'select', options: ['1 Year', '2 Years', '3 Years', '5 Years', 'Indefinite'], required: true },
      { id: 'governingState', label: 'Governing Jurisdiction / State', type: 'text', required: true, placeholder: 'e.g. New Delhi / Maharashtra / Karnataka' }
    ]
  },
  RENTAL_AGREEMENT: {
    id: 'RENTAL_AGREEMENT',
    name: 'Residential Rental Agreement',
    description: 'Standard lease agreement between landlord and tenant for residential property in India.',
    category: 'Real Estate & Lease',
    jurisdiction: 'India (IN)',
    questions: [
      { id: 'landlordName', label: 'Landlord / Owner Name', type: 'text', required: true, placeholder: 'e.g. Rajesh Kumar' },
      { id: 'tenantName', label: 'Tenant Name', type: 'text', required: true, placeholder: 'e.g. Amit Sharma' },
      { id: 'propertyAddress', label: 'Full Property Address', type: 'text', required: true, placeholder: 'e.g. Flat 402, Green Park Heights, Indiranagar, Bengaluru' },
      { id: 'monthlyRent', label: 'Monthly Rent Amount (INR)', type: 'number', required: true, placeholder: '25000' },
      { id: 'securityDeposit', label: 'Security Deposit Amount (INR)', type: 'number', required: true, placeholder: '100000' },
      { id: 'startDate', label: 'Agreement Start Date', type: 'date', required: true },
      { id: 'tenureMonths', label: 'Lease Tenure (Months)', type: 'select', options: ['11 Months', '12 Months', '24 Months', '36 Months'], required: true },
      { id: 'noticePeriodDays', label: 'Notice Period (Days)', type: 'select', options: ['30 Days', '60 Days', '90 Days'], required: true },
      { id: 'maintenancePayer', label: 'Maintenance Responsibility', type: 'select', options: ['Tenant', 'Landlord', 'Shared 50-50'], required: true },
      { id: 'governingState', label: 'State Jurisdiction', type: 'text', required: true, placeholder: 'e.g. Karnataka / Delhi / Maharashtra' }
    ]
  },
  EMPLOYMENT_CONTRACT: {
    id: 'EMPLOYMENT_CONTRACT',
    name: 'Employment Agreement',
    description: 'Comprehensive employment contract covering salary, duties, probation, IP assignment, and notice period.',
    category: 'Employment & HR',
    jurisdiction: 'India (IN)',
    questions: [
      { id: 'employerName', label: 'Employer / Company Name', type: 'text', required: true, placeholder: 'e.g. Lexora Tech Pvt Ltd' },
      { id: 'employeeName', label: 'Employee Full Name', type: 'text', required: true, placeholder: 'e.g. Priya Sundaram' },
      { id: 'jobTitle', label: 'Job Designation / Title', type: 'text', required: true, placeholder: 'e.g. Senior Software Engineer' },
      { id: 'annualSalary', label: 'Annual CTC Salary (INR)', type: 'number', required: true, placeholder: '1200000' },
      { id: 'startDate', label: 'Joining Date', type: 'date', required: true },
      { id: 'hasProbation', label: 'Include Probation Period?', type: 'select', options: ['Yes', 'No'], required: true },
      { id: 'probationMonths', label: 'Probation Duration (Months)', type: 'select', options: ['3 Months', '6 Months'], condition: { field: 'hasProbation', value: 'Yes' } },
      { id: 'noticePeriodDays', label: 'Notice Period (Days)', type: 'select', options: ['30 Days', '60 Days', '90 Days'], required: true },
      { id: 'workLocation', label: 'Work Location / Mode', type: 'select', options: ['On-Site (Office)', 'Remote', 'Hybrid'], required: true },
      { id: 'governingState', label: 'Governing Jurisdiction State', type: 'text', required: true, placeholder: 'e.g. Karnataka / Maharashtra' }
    ]
  },
  FREELANCE_AGREEMENT: {
    id: 'FREELANCE_AGREEMENT',
    name: 'Freelance Service Agreement',
    description: 'Independent contractor agreement defining deliverables, payment milestones, IP transfer, and termination terms.',
    category: 'Services & Contracting',
    jurisdiction: 'India (IN)',
    questions: [
      { id: 'clientName', label: 'Client / Hiring Company Name', type: 'text', required: true, placeholder: 'e.g. Nexus Media Solutions' },
      { id: 'freelancerName', label: 'Freelancer / Contractor Name', type: 'text', required: true, placeholder: 'e.g. Rohan Verma' },
      { id: 'serviceDescription', label: 'Description of Services / Deliverables', type: 'text', required: true, placeholder: 'e.g. Full-stack Web Development & UI Design' },
      { id: 'totalFee', label: 'Total Project Fee (INR)', type: 'number', required: true, placeholder: '75000' },
      { id: 'paymentSchedule', label: 'Payment Terms / Milestones', type: 'select', options: ['50% Upfront, 50% on Completion', '100% On Completion', 'Monthly Milestone Payments'], required: true },
      { id: 'completionDate', label: 'Target Completion Date', type: 'date', required: true },
      { id: 'ipTransfer', label: 'IP Ownership Transfer', type: 'select', options: ['Transferred to Client upon full payment', 'Retained by Freelancer under non-exclusive license'], required: true }
    ]
  },
  INTERNSHIP_AGREEMENT: {
    id: 'INTERNSHIP_AGREEMENT',
    name: 'Internship Offer & Agreement',
    description: 'Formal agreement outlining intern duties, stipend, duration, confidentiality, and certificate terms.',
    category: 'Employment & HR',
    jurisdiction: 'India (IN)',
    questions: [
      { id: 'companyName', label: 'Company Name', type: 'text', required: true, placeholder: 'e.g. Apex Innovations' },
      { id: 'internName', label: 'Intern Name', type: 'text', required: true, placeholder: 'e.g. Sneha Patel' },
      { id: 'roleTitle', label: 'Internship Role', type: 'text', required: true, placeholder: 'e.g. AI Research Intern' },
      { id: 'stipendAmount', label: 'Monthly Stipend (INR)', type: 'number', required: true, placeholder: '15000' },
      { id: 'durationMonths', label: 'Duration (Months)', type: 'select', options: ['2 Months', '3 Months', '6 Months'], required: true },
      { id: 'startDate', label: 'Start Date', type: 'date', required: true }
    ]
  }
};

export const generateLegalDocument = (type, answers) => {
  const dateStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  if (type === 'NDA') {
    return `# NON-DISCLOSURE AGREEMENT (NDA)

**THIS NON-DISCLOSURE AGREEMENT** ("Agreement") is executed on this **${dateStr}** at **${answers.governingState || 'New Delhi, India'}**.

### BY AND BETWEEN:

1. **${answers.disclosingParty || 'DISCLOSING PARTY NAME'}**, having its principal address in India (hereinafter referred to as the **"Disclosing Party"**).
2. **${answers.receivingParty || 'RECEIVING PARTY NAME'}**, residing or operating in India (hereinafter referred to as the **"Receiving Party"**).

---

### 1. PURPOSE
The Disclosing Party agrees to disclose confidential technical, operational, and financial information to the Receiving Party solely for the purpose of:
> *"${answers.purpose || 'Evaluation of potential business collaboration and technical integration'}"*

### 2. DEFINITION OF CONFIDENTIAL INFORMATION
Confidential Information includes all non-public information disclosed by the Disclosing Party, specifically encompassing:
- **Scope**: ${answers.confidentialScope || 'All technical, financial, and business data'}
- Source code, software architectures, algorithms, financial statements, customer lists, and strategic roadmaps.

### 3. OBLIGATIONS OF RECEIVING PARTY
The Receiving Party agrees:
- To maintain strict confidentiality and exercise utmost care in protecting the Disclosing Party's proprietary data.
- Not to copy, reverse engineer, or disclose any portion of Confidential Information to third parties without prior written approval.

### 4. DURATION & TERMINATION
The obligations under this Agreement shall remain in force for a period of **${answers.duration || '2 Years'}** from the date of execution.

### 5. GOVERNING LAW & JURISDICTION
This Agreement shall be governed by and construed in accordance with the laws of **India**. Any legal disputes shall be subject to the exclusive jurisdiction of courts located in **${answers.governingState || 'New Delhi'}**.

---

**IN WITNESS WHEREOF**, the parties have signed and delivered this Non-Disclosure Agreement as of the date first above written.

**Disclosing Party:** ${answers.disclosingParty}  
**Receiving Party:** ${answers.receivingParty}
`;
  }

  if (type === 'RENTAL_AGREEMENT') {
    return `# RESIDENTIAL RENTAL AGREEMENT

**THIS RENTAL AGREEMENT** is made on **${dateStr}** at **${answers.governingState || 'Karnataka, India'}**.

### PARTIES:

- **LANDLORD:** **${answers.landlordName || 'LANDLORD NAME'}**
- **TENANT:** **${answers.tenantName || 'TENANT NAME'}**

---

### 1. DEMISED PREMISES
The Landlord hereby agrees to let out and the Tenant agrees to take on rent the residential premises situated at:
> **${answers.propertyAddress || 'PROPERTY ADDRESS'}**

### 2. RENT & SECURITY DEPOSIT
- **Monthly Rent:** ₹${answers.monthlyRent || '0'} per month, payable in advance by the 5th day of every calendar month.
- **Security Deposit:** ₹${answers.securityDeposit || '0'} paid by the Tenant upon execution of this Agreement (refundable upon vacant possession handover).

### 3. TENURE & NOTICE PERIOD
- **Lease Duration:** **${answers.tenureMonths || '11 Months'}**, starting from **${answers.startDate || dateStr}**.
- **Notice Period:** Either party may terminate this agreement by giving **${answers.noticePeriodDays || '30 Days'}** written notice to the other party.

### 4. MAINTENANCE & UTILITIES
- Electricity, water, and internet usage fees shall be paid by the Tenant.
- Maintenance responsibility: **${answers.maintenancePayer || 'Tenant'}**.

### 5. JURISDICTION
Governed by the Rent Control laws of **${answers.governingState || 'India'}**.

---

**Landlord:** ${answers.landlordName}  
**Tenant:** ${answers.tenantName}
`;
  }

  if (type === 'EMPLOYMENT_CONTRACT') {
    return `# EMPLOYMENT AGREEMENT

**THIS EMPLOYMENT AGREEMENT** is entered into on **${dateStr}** between **${answers.employerName || 'EMPLOYER NAME'}** ("Company") and **${answers.employeeName || 'EMPLOYEE NAME'}** ("Employee").

---

### 1. POSITION & DUTIES
The Employee is engaged in the position of **${answers.jobTitle || 'Designation'}**. The Employee agrees to perform duties faithfully and to the best of their skill and ability.

### 2. COMPENSATION & SALARY
- **Cost to Company (CTC):** ₹${answers.annualSalary || '0'} per annum.
- **Payment Terms:** Monthly disbursement subject to applicable statutory Indian tax deductions (TDS, PF).

### 3. PROBATION & NOTICE PERIOD
- **Probationary Period:** ${answers.hasProbation === 'Yes' ? answers.probationMonths || '3 Months' : 'None'}.
- **Notice Period:** **${answers.noticePeriodDays || '30 Days'}** written notice required for resignation or termination.

### 4. WORK LOCATION & MODE
- **Location:** ${answers.workLocation || 'On-Site Office'}.

### 5. INTELLECTUAL PROPERTY
All software code, designs, documentation, and inventions developed during employment shall remain the sole intellectual property of the Company.

---

**For Company:** ${answers.employerName}  
**Employee:** ${answers.employeeName}
`;
  }

  if (type === 'FREELANCE_AGREEMENT') {
    return `# FREELANCE SERVICE AGREEMENT

**EXECUTED ON:** ${dateStr}  
**CLIENT:** ${answers.clientName}  
**CONTRACTOR / FREELANCER:** ${answers.freelancerName}

---

### 1. SCOPE OF SERVICES
The Freelancer agrees to deliver:
> *${answers.serviceDescription || 'Software development & technical services'}*

### 2. FEES & MILESTONES
- **Total Compensation:** ₹${answers.totalFee || '0'} INR.
- **Payment Structure:** ${answers.paymentSchedule || '50% Upfront, 50% on Completion'}.
- **Target Completion Date:** ${answers.completionDate || 'As agreed'}.

### 3. INTELLECTUAL PROPERTY
${answers.ipTransfer || 'Transferred to Client upon full payment'}.

---

**Client:** ${answers.clientName}  
**Freelancer:** ${answers.freelancerName}
`;
  }

  if (type === 'INTERNSHIP_AGREEMENT') {
    return `# INTERNSHIP OFFER & AGREEMENT

**DATE:** ${dateStr}  
**COMPANY:** ${answers.companyName}  
**INTERN:** ${answers.internName}

---

### 1. INTERNSHIP ROLE & DURATION
- **Role:** ${answers.roleTitle || 'Intern'}
- **Duration:** ${answers.durationMonths || '3 Months'}, commencing on ${answers.startDate || dateStr}.

### 2. STIPEND
- Monthly Stipend: ₹${answers.stipendAmount || '15000'} INR.

### 3. CONFIDENTIALITY
The Intern shall maintain strict confidentiality regarding all company data, project tools, and customer information.

---

**Company:** ${answers.companyName}  
**Intern:** ${answers.internName}
`;
  }

  return `# LEGAL DOCUMENT DRAFT\n\nGenerated on ${dateStr}\n\n${JSON.stringify(answers, null, 2)}`;
};
