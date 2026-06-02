export type Step1Data = {
  fullName: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  maritalStatus: string;
};

export type Step2Data = {
  email: string;
  phoneCode: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phAddress: string;
  ecName: string;
  ecRelationship: string;
  ecPhone: string;
};

export type ServicePlan = "basic" | "premium" | "vip" | "";

export type DocumentFile = {
  file: File | null;
  name: string;
};

export type Step4Data = {
  passportBio: DocumentFile;
  validVisa: DocumentFile;
  nbiClearance: DocumentFile;
  pensionCert: DocumentFile;
  medicalExam: DocumentFile;
};
