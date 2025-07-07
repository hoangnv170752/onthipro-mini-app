/**
 * Exam service for Ôn Thi Pro
 * Handles exam-related API requests
 */

import { API_BASE_URL } from '@/config/env';
import { authenticatedFetch } from './auth';

// Types for exam data
export interface ExamDetail {
  id: number;
  name: string;
  description: string;
  documentUrl: string;
  totalQuestions: number;
  examDuration: number; // in minutes
  createdAt: string;
}

export interface UserExam {
  id: number;
  exam: ExamDetail;
  attemptCount: number;
  createdAt: string;
}

// Simplified exam type for display
export interface Exam {
  id: number;
  title: string;
  description: string;
  duration: number; // in minutes
  exam_date: string;
  status: 'registered' | 'completed' | 'upcoming';
  score?: number;
  documentUrl?: string;
}

/**
 * Fetch user exams from the API
 * @returns Promise with user exams data
 */
export const getUserExams = async (): Promise<Exam[]> => {
  try {
    console.log('Fetching user exams from:', `${API_BASE_URL}/user-exams`);
    
    const response = await authenticatedFetch(`${API_BASE_URL}/user-exams`, {
      method: 'GET'
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`Failed to fetch exams: ${response.status}`);
    }

    const userExams: UserExam[] = await response.json();
    console.log('Exams fetched successfully:', userExams.length);
    
    // Transform the API response to our Exam interface format
    const exams: Exam[] = userExams.map(userExam => ({
      id: userExam.id,
      title: userExam.exam.name,
      description: userExam.exam.description,
      duration: userExam.exam.examDuration,
      exam_date: userExam.exam.createdAt,
      status: userExam.attemptCount > 0 ? 'completed' : 'registered',
      documentUrl: userExam.exam.documentUrl
    }));
    
    return exams;
  } catch (error) {
    console.error('Error fetching user exams:', error);
    // Return empty array instead of throwing to avoid breaking the UI
    return [];
  }
};

/**
 * Format exam date from ISO format
 * @param isoDate ISO date string
 * @returns Formatted date string (DD/MM/YYYY)
 */
export const formatExamDate = (isoDate: string): string => {
  const date = new Date(isoDate);
  return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1)
    .toString()
    .padStart(2, '0')}/${date.getFullYear()}`;
};

export default {
  getUserExams,
  formatExamDate
};
