export interface Photo {
  id: string;
  url: string;
  title: string;
  photographer: string;
  votes: number;
  userVoted: boolean;
  dateAdded: string;
  description?: string;
}

export interface User {
  id: string;
  username: string;
  photoURL?: string;
  votedPhotos: string[];
}