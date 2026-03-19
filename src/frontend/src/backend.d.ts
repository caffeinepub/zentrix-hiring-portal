import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface SalaryRange {
    max: bigint;
    min: bigint;
    currency: string;
}
export type Time = bigint;
export interface JobApplication {
    status: ApplicationStatus;
    appliedAt: Time;
    applicantName: string;
    selfieFileId: string;
    bankPassbookFileId: string;
    trackingId: string;
    coverLetter: string;
    resumeFileId: string;
    additionalFileIds: Array<string>;
    email: string;
    experience: string;
    updatedAt: Time;
    panFileId: string;
    aadhaarFileId: string;
    phone: string;
    position: string;
    adminNotes: string;
}
export interface JobPosting {
    id: string;
    title: string;
    salary: SalaryRange;
    jobType: Variant_contract_partTime_fullTime;
    createdAt: Time;
    description: string;
    isActive: boolean;
    department: string;
    requirements: string;
    location: string;
}
export interface DashboardStats {
    pendingCount: bigint;
    hiredCount: bigint;
    shortlistedCount: bigint;
    totalActiveJobs: bigint;
    totalApplications: bigint;
}
export interface BlobFileRef {
    blob: ExternalBlob;
    fileType: string;
    fileId: string;
    uploadedAt: Time;
}
export interface JobApplicationInput {
    applicantName: string;
    selfieFileId: string;
    bankPassbookFileId: string;
    coverLetter: string;
    resumeFileId: string;
    additionalFileIds: Array<string>;
    email: string;
    experience: string;
    panFileId: string;
    aadhaarFileId: string;
    phone: string;
    position: string;
}
export interface JobPostingInput {
    id: string;
    title: string;
    salary: SalaryRange;
    jobType: Variant_contract_partTime_fullTime;
    description: string;
    isActive: boolean;
    department: string;
    requirements: string;
    location: string;
}
export interface UserProfile {
    name: string;
}
export enum ApplicationStatus {
    reviewing = "reviewing",
    hired = "hired",
    pending = "pending",
    rejected = "rejected",
    shortlisted = "shortlisted"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_contract_partTime_fullTime {
    contract = "contract",
    partTime = "partTime",
    fullTime = "fullTime"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    bulkUpdateStatus(trackingIds: Array<string>, status: ApplicationStatus): Promise<void>;
    createJobPost(input: JobPostingInput): Promise<string>;
    deleteApplication(trackingId: string): Promise<void>;
    deleteJobPost(id: string): Promise<void>;
    getActiveJobs(): Promise<Array<JobPosting>>;
    getApplicationByTrackingId(trackingId: string): Promise<JobApplication>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDashboardStats(): Promise<DashboardStats>;
    getFile(fileId: string): Promise<BlobFileRef>;
    getJobPost(id: string): Promise<JobPosting>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listAllApplications(): Promise<Array<JobApplication>>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitApplication(input: JobApplicationInput): Promise<JobApplication>;
    updateApplicationStatus(trackingId: string, status: ApplicationStatus, notes: string): Promise<void>;
    updateJobPost(id: string, input: JobPostingInput): Promise<void>;
    uploadFile(fileId: string, externalBlob: ExternalBlob, fileType: string): Promise<void>;
}
