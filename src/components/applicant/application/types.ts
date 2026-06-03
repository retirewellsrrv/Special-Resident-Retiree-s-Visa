export type Step1Data = {
  name: string;
  birthday: string;
  sex: string;
  nationality: string;
  maritalStatus: string;
};

export type Step2Data = {
  email: string;
  phoneCode: string;
  phoneNumber: string;
  streetAddress: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phAddress: string;
  emergencyName: string;
  emergencyRelationship: string;
  emergencyPhone: string;
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
