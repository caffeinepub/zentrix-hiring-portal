import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Storage "blob-storage/Storage";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import List "mo:core/List";
import MixinStorage "blob-storage/Mixin";

actor {
  // Blob storage mixin
  include MixinStorage();

  // Admin system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type SalaryRange = {
    min : Nat;
    max : Nat;
    currency : Text;
  };

  // Job Posting
  type JobPosting = {
    id : Text;
    title : Text;
    department : Text;
    location : Text;
    jobType : { #fullTime; #partTime; #contract };
    description : Text;
    requirements : Text;
    salary : SalaryRange;
    isActive : Bool;
    createdAt : Time.Time;
  };

  // Application Status
  type ApplicationStatus = {
    #pending;
    #reviewing;
    #shortlisted;
    #rejected;
    #hired;
  };

  // File reference (blob storage)
  type BlobFileRef = {
    fileId : Text;
    blob : Storage.ExternalBlob;
    fileType : Text;
    uploadedAt : Time.Time;
  };

  // Job Application
  type JobApplication = {
    trackingId : Text;
    applicantName : Text;
    email : Text;
    phone : Text;
    position : Text;
    experience : Text;
    coverLetter : Text;
    resumeFileId : Text;
    aadhaarFileId : Text;
    panFileId : Text;
    selfieFileId : Text;
    bankPassbookFileId : Text;
    additionalFileIds : [Text];
    status : ApplicationStatus;
    adminNotes : Text;
    appliedAt : Time.Time;
    updatedAt : Time.Time;
  };

  // Dashboard Stats
  type DashboardStats = {
    totalApplications : Nat;
    pendingCount : Nat;
    shortlistedCount : Nat;
    hiredCount : Nat;
    totalActiveJobs : Nat;
  };

  type JobPostingInput = {
    id : Text;
    title : Text;
    department : Text;
    location : Text;
    jobType : { #fullTime; #partTime; #contract };
    description : Text;
    requirements : Text;
    salary : SalaryRange;
    isActive : Bool;
  };

  type JobApplicationInput = {
    applicantName : Text;
    email : Text;
    phone : Text;
    position : Text;
    experience : Text;
    coverLetter : Text;
    resumeFileId : Text;
    aadhaarFileId : Text;
    panFileId : Text;
    selfieFileId : Text;
    bankPassbookFileId : Text;
    additionalFileIds : [Text];
  };

  // User Profile (required by design guidelines)
  public type UserProfile = {
    name : Text;
  };

  // Persistent storage
  var nextJobId = 1;
  let jobPostings = Map.empty<Text, JobPosting>();
  let applications = Map.empty<Text, JobApplication>();
  let fileRefs = Map.empty<Text, BlobFileRef>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // User Profile Methods (required by design guidelines)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    userProfiles.add(caller, profile);
  };

  // Job Posting Methods
  public shared ({ caller }) func createJobPost(input : JobPostingInput) : async Text {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can create job postings");
    };

    let id = "JOB" # nextJobId.toText();
    nextJobId += 1;

    let job : JobPosting = {
      input with
      id;
      createdAt = Time.now();
    };
    jobPostings.add(id, job);
    id;
  };

  // Public can view any job posting
  public query ({ caller }) func getJobPost(id : Text) : async JobPosting {
    switch (jobPostings.get(id)) {
      case (?job) { job };
      case (null) { Runtime.trap("Job not found") };
    };
  };

  // Public can view active jobs
  public query ({ caller }) func getActiveJobs() : async [JobPosting] {
    jobPostings.values().toArray().filter(func(j) { j.isActive });
  };

  public shared ({ caller }) func updateJobPost(id : Text, input : JobPostingInput) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update job postings");
    };

    switch (jobPostings.get(id)) {
      case (?existing) {
        let updated : JobPosting = {
          input with
          id;
          createdAt = existing.createdAt;
        };
        jobPostings.add(id, updated);
      };
      case (null) { Runtime.trap("Job not found") };
    };
  };

  public shared ({ caller }) func deleteJobPost(id : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete job postings");
    };

    switch (jobPostings.get(id)) {
      case (?_) {
        jobPostings.remove(id);
      };
      case (null) { Runtime.trap("Job not found") };
    };
  };

  // Application Methods
  // Public can submit applications - changed from query to shared
  public shared ({ caller }) func submitApplication(input : JobApplicationInput) : async JobApplication {
    let trackingId = "ZTX" # Time.now().toText() # (applications.size() + 1).toText();

    let application : JobApplication = {
      input with
      trackingId;
      status = #pending;
      adminNotes = "";
      appliedAt = Time.now();
      updatedAt = Time.now();
    };
    // Fixed: Actually save the application
    applications.add(trackingId, application);
    application;
  };

  // Public can view application by tracking ID
  public query ({ caller }) func getApplicationByTrackingId(trackingId : Text) : async JobApplication {
    switch (applications.get(trackingId)) {
      case (?app) { app };
      case (null) { Runtime.trap("Application not found") };
    };
  };

  // Admin only: List all applications
  public query ({ caller }) func listAllApplications() : async [JobApplication] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can list all applications");
    };
    applications.values().toArray();
  };

  public shared ({ caller }) func updateApplicationStatus(trackingId : Text, status : ApplicationStatus, notes : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update applications");
    };

    switch (applications.get(trackingId)) {
      case (?app) {
        let updated : JobApplication = {
          app with
          status;
          adminNotes = notes;
          updatedAt = Time.now();
        };
        applications.add(trackingId, updated);
      };
      case (null) { Runtime.trap("Application not found") };
    };
  };

  public shared ({ caller }) func bulkUpdateStatus(trackingIds : [Text], status : ApplicationStatus) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can perform bulk updates");
    };

    for (id in trackingIds.values()) {
      switch (applications.get(id)) {
        case (?app) {
          let updated : JobApplication = {
            app with
            status;
            updatedAt = Time.now();
          };
          applications.add(id, updated);
        };
        case (null) { /* Ignore not found */ };
      };
    };
  };

  public shared ({ caller }) func deleteApplication(trackingId : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete applications");
    };

    switch (applications.get(trackingId)) {
      case (?_) {
        applications.remove(trackingId);
      };
      case (null) { Runtime.trap("Application not found") };
    };
  };

  // File Handling - Public can upload (for application documents)
  public shared ({ caller }) func uploadFile(fileId : Text, externalBlob : Storage.ExternalBlob, fileType : Text) : async () {
    let fileRef : BlobFileRef = {
      fileId;
      blob = externalBlob;
      fileType;
      uploadedAt = Time.now();
    };
    fileRefs.add(fileId, fileRef);
  };

  // Public can retrieve files (needed for viewing uploaded documents)
  public query ({ caller }) func getFile(fileId : Text) : async BlobFileRef {
    switch (fileRefs.get(fileId)) {
      case (?file) { file };
      case (null) { Runtime.trap("File not found") };
    };
  };

  // Dashboard Stats - Admin only (contains sensitive business metrics)
  public query ({ caller }) func getDashboardStats() : async DashboardStats {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view dashboard statistics");
    };

    let apps = applications.values().toArray();
    let jobs = jobPostings.values().toArray();

    let pendingCount = apps.filter(func(a) { a.status == #pending }).size();
    let shortlistedCount = apps.filter(func(a) { a.status == #shortlisted }).size();
    let hiredCount = apps.filter(func(a) { a.status == #hired }).size();
    let activeJobs = jobs.filter(func(j) { j.isActive }).size();

    {
      totalApplications = apps.size();
      pendingCount;
      shortlistedCount;
      hiredCount;
      totalActiveJobs = activeJobs;
    };
  };
};
