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
  markers?: Marker[];
  updatedAt: string;
};

export type Marker = {
  id: string;
  name: string;
  color: string;
};

export type EntryMarker = Marker & {
  entryDate: string;
};

export type PairingSession = {
  id: string;
  token: string;
  expiresAt: string;
  entryId: string;
};
