import { db } from "../firebase/admin";
import { hashPassword } from "../app/lib/users";

interface User {
  id: string;
  name: string | null;
  email: string;
  password: string | null;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
  summary: string | null;
  workExperience: string | null;
  projects: string | null;
  skills: string | null;
  education: string | null;
  certifications: string | null;
}

// User operations
export const createUser = async (userData: any) => {
  try {
    const { email, password, fullname, image } = userData;
    
    // Hash the password before storing (only if password is provided)
    let hashedPassword = null;
    if (password) {
      hashedPassword = await hashPassword(password);
    }
    
    // Create user document in Firestore
    const userRef = db.collection("users").doc();
    const userDataToStore = {
      name: fullname,
      email: email,
      password: hashedPassword,
      image: image || null,
      createdAt: new Date(),
      updatedAt: new Date(),
      // Profile fields (optional)
      summary: null,
      workExperience: null,
      projects: null,
      skills: null,
      education: null,
      certifications: null
    };
    
    await userRef.set(userDataToStore);
    return { id: userRef.id, ...userDataToStore };
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

// Get user with interviews and feedback
export const getUserWithInterviewsAndFeedback = async (userId: string) => {
  try {
    // Get user data
    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return null;
    }
    
    const userData: any = userDoc.data();
    
    // Get user's interviews
    const interviewsRef = db.collection("interviews");
    const interviewsQuery = await interviewsRef.where("userId", "==", userId).get();
    
    const interviews: any[] = [];
    interviewsQuery.forEach((doc: any) => {
      interviews.push({ id: doc.id, ...doc.data() });
    });
    
    // Get user's feedback
    const feedbackRef = db.collection("interviewFeedbacks");
    const feedbackQuery = await feedbackRef.where("userId", "==", userId).get();
    
    const feedback: any[] = [];
    feedbackQuery.forEach((doc: any) => {
      feedback.push({ id: doc.id, ...doc.data() });
    });
    
    return {
      id: userId,
      ...userData,
      interviews: interviews,
      feedBack: feedback
    };
  } catch (error) {
    console.error("Error getting user with interviews and feedback:", error);
    return null;
  }
};

// Get user by ID with basic info
export const getUserByIdBasic = async (userId: string) => {
  try {
    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return null;
    }
    
    const userData: any = userDoc.data();
    return { 
      id: userDoc.id, 
      name: userData?.name, 
      email: userData?.email, 
      image: userData?.image 
    };
  } catch (error) {
    console.error("Error getting user by ID:", error);
    return null;
  }
};

// Get interviews by user ID
export const getInterviewsByUserIdBasic = async (userId: string) => {
  try {
    const interviewsRef = db.collection("interviews");
    const querySnapshot = await interviewsRef
      .where("userId", "==", userId)
      .get();
    
    const interviews: any[] = [];
    querySnapshot.forEach((doc: any) => {
      const data = doc.data();
      interviews.push({ 
        id: doc.id, 
        isCompleted: data.isCompleted,
        createdAt: data.createdAt
      });
    });
    
    // Sort by createdAt in descending order
    interviews.sort((a, b) => {
      // Handle Firebase Timestamp objects and various date formats
      const parseDate = (dateValue: any): number => {
        if (!dateValue) return 0;
        
        // If it's already a number (timestamp)
        if (typeof dateValue === 'number') {
          return dateValue;
        }
        
        // If it has toDate method (Firebase Timestamp)
        if (dateValue?.toDate) {
          return dateValue.toDate().getTime();
        }
        
        // If it's already a Date object
        if (dateValue instanceof Date) {
          return dateValue.getTime();
        }
        
        // If it's a string, try to parse it
        if (typeof dateValue === 'string') {
          const parsed = new Date(dateValue);
          return isNaN(parsed.getTime()) ? 0 : parsed.getTime();
        }
        
        // If it's an object with seconds/nanoseconds (Firebase Timestamp-like)
        if (dateValue?.seconds !== undefined) {
          return dateValue.seconds * 1000 + (dateValue.nanoseconds || 0) / 1000000;
        }
        
        // Fallback
        return 0;
      };
      
      const dateA = parseDate(a.createdAt);
      const dateB = parseDate(b.createdAt);
      
      return dateB - dateA;
    });
    
    return interviews;
  } catch (error) {
    console.error("Error getting interviews by user ID:", error);
    return [];
  }
};

// Get all users with feedback for leaderboard
export const getAllUsersWithFeedback = async () => {
  try {
    // This is a simplified implementation
    // In a production environment, you might want to use a more efficient approach
    const usersRef = db.collection("users");
    const usersQuery = await usersRef.get();
    
    const users: any[] = [];
    for (const userDoc of usersQuery.docs) {
      const userData = userDoc.data();
      
      // Only include users who have a name
      if (!userData.name) continue;
      
      // Get user's feedback
      const feedbackRef = db.collection("interviewFeedbacks");
      const feedbackQuery = await feedbackRef.where("userId", "==", userDoc.id).get();
      
      const feedback: any[] = [];
      feedbackQuery.forEach((doc: any) => {
        feedback.push(doc.data());
      });
      
      if (feedback.length > 0) {
        users.push({
          id: userDoc.id,
          name: userData.name,
          image: userData.image,
          feedBack: feedback
        });
      }
    }
    
    return users;
  } catch (error) {
    console.error("Error getting all users with feedback:", error);
    return [];
  }
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  try {
    const usersRef = db.collection("users");
    const querySnapshot = await usersRef.where("email", "==", email).get();
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();
    return { id: userDoc.id, ...userData } as User;
  } catch (error) {
    console.error("Error getting user by email:", error);
    return null;
  }
};

export const getUserById = async (userId: string) => {
  try {
    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return null;
    }
    
    const userData = userDoc.data();
    return { id: userDoc.id, ...userData };
  } catch (error) {
    console.error("Error getting user by ID:", error);
    return null;
  }
};

export const updateUserProfile = async (userId: string, profileData: any) => {
  try {
    const userRef = db.collection("users").doc(userId);
    
    // Only update profile fields
    const profileFields = {
      summary: profileData.summary,
      workExperience: profileData.workExperience,
      projects: profileData.projects,
      skills: profileData.skills,
      education: profileData.education,
      certifications: profileData.certifications,
      updatedAt: new Date()
    };
    
    await userRef.set(profileFields, { merge: true });
    return { success: true };
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

// Interview operations
export const createInterview = async (interviewData: any) => {
  try {
    const interviewRef = db.collection("interviews").doc();
    
    const interviewDataToStore = {
      ...interviewData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await interviewRef.set(interviewDataToStore);
    return { id: interviewRef.id, ...interviewDataToStore };
  } catch (error) {
    console.error("Error creating interview:", error);
    throw error;
  }
};

export const getInterviewById = async (interviewId: string) => {
  try {
    const interviewRef = db.collection("interviews").doc(interviewId);
    const interviewDoc = await interviewRef.get();
    
    if (!interviewDoc.exists) {
      return null;
    }
    
    const interviewData = interviewDoc.data();
    return { id: interviewDoc.id, ...interviewData };
  } catch (error) {
    console.error("Error getting interview by ID:", error);
    return null;
  }
};

export const getInterviewsByUserId = async (userId: string) => {
  try {
    const interviewsRef = db.collection("interviews");
    const querySnapshot = await interviewsRef
      .where("userId", "==", userId)
      .get();
    
    const interviews: any[] = [];
    querySnapshot.forEach((doc: any) => {
      interviews.push({ id: doc.id, ...doc.data() });
    });
    
    // Get feedback for these interviews
    const interviewIds = interviews.map(interview => interview.id);
    const feedbackRef = db.collection("interviewFeedbacks");
    const feedbackPromises = interviewIds.map(interviewId => 
      feedbackRef.where("interviewId", "==", interviewId).get()
    );
    
    const feedbackResults = await Promise.all(feedbackPromises);
    
    // Attach feedback to interviews
    const interviewsWithFeedback = interviews.map((interview, index) => {
      const feedbackDocs = feedbackResults[index];
      let feedback = null;
      if (!feedbackDocs.empty) {
        feedbackDocs.forEach((doc: any) => {
          feedback = { id: doc.id, ...doc.data() };
        });
      }
      return { ...interview, feedBack: feedback };
    });
    
    // Sort by createdAt in descending order
    interviewsWithFeedback.sort((a, b) => {
      // Handle Firebase Timestamp objects and various date formats
      const parseDate = (dateValue: any): number => {
        if (!dateValue) return 0;
        
        // If it's already a number (timestamp)
        if (typeof dateValue === 'number') {
          return dateValue;
        }
        
        // If it has toDate method (Firebase Timestamp)
        if (dateValue?.toDate) {
          return dateValue.toDate().getTime();
        }
        
        // If it's already a Date object
        if (dateValue instanceof Date) {
          return dateValue.getTime();
        }
        
        // If it's a string, try to parse it
        if (typeof dateValue === 'string') {
          const parsed = new Date(dateValue);
          return isNaN(parsed.getTime()) ? 0 : parsed.getTime();
        }
        
        // If it's an object with seconds/nanoseconds (Firebase Timestamp-like)
        if (dateValue?.seconds !== undefined) {
          return dateValue.seconds * 1000 + (dateValue.nanoseconds || 0) / 1000000;
        }
        
        // Fallback
        return 0;
      };
      
      const dateA = parseDate(a.createdAt);
      const dateB = parseDate(b.createdAt);
      
      return dateB - dateA;
    });
    
    return interviewsWithFeedback;
  } catch (error) {
    console.error("Error getting interviews by user ID:", error);
    throw error;
  }
};

export const updateInterview = async (interviewId: string, updateData: any) => {
  try {
    const interviewRef = db.collection("interviews").doc(interviewId);
    
    const updateFields = {
      ...updateData,
      updatedAt: new Date()
    };
    
    await interviewRef.update(updateFields);
    return { success: true };
  } catch (error) {
    console.error("Error updating interview:", error);
    throw error;
  }
};

// Interview feedback operations
export const createInterviewFeedback = async (feedbackData: any) => {
  try {
    const feedbackRef = db.collection("interviewFeedbacks").doc();
    
    const feedbackDataToStore = {
      ...feedbackData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await feedbackRef.set(feedbackDataToStore);
    return { id: feedbackRef.id, ...feedbackDataToStore };
  } catch (error) {
    console.error("Error creating interview feedback:", error);
    throw error;
  }
};