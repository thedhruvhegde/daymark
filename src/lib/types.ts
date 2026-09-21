export type EntryStatus = "empty" | "draft" | "complete" | "locked";

export type JournalImage = {
  id: string;
  path: string;
  signedUrl?: string;
  position: number;
};

export type JournalEntry = {
  id: string;
  entryDate: string;
  body: string;
  status: EntryStatus;
  images: JournalImage[];
  updatedAt: string;
};

export type PairingSession = {
  id: string;
  token: string;
  expiresAt: string;
  entryId: string;
};
