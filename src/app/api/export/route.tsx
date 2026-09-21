import { Document, Image, Page, Text, View, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const styles = StyleSheet.create({
  page: { padding: 44, fontFamily: "Helvetica", color: "#222420" },
  eyebrow: { fontSize: 9, color: "#787b72", letterSpacing: 1.4, textTransform: "uppercase" },
  heading: { marginTop: 8, marginBottom: 18, fontSize: 24, fontFamily: "Helvetica-Bold" },
  body: { fontSize: 11, lineHeight: 1.7, color: "#363831" },
  rule: { marginTop: 30, borderTopWidth: 1, borderTopColor: "#e8e9e2" },
  photos: { marginTop: 18, flexDirection: "row", gap: 8 },
  photo: { width: 155, height: 155, objectFit: "cover", borderRadius: 8 },
});

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data: entries } = await supabase.from("journal_entries").select("entry_date, body, journal_images(id, storage_path)").eq("user_id", user.id).order("entry_date");
  const withUrls = await Promise.all((entries ?? []).map(async (entry) => {
    const paths = entry.journal_images.map((image) => image.storage_path);
    const { data } = paths.length ? await supabase.storage.from("journal-images").createSignedUrls(paths, 600) : { data: [] };
    return { ...entry, photoUrls: data?.map((photo) => photo.signedUrl).filter((url): url is string => typeof url === "string") ?? [] };
  }));
  const document = <Document title="My Daymark"><Page size="A4" style={styles.page}>{withUrls.map((entry) => <View key={entry.entry_date} wrap={false}><Text style={styles.eyebrow}>Daymark / {entry.journal_images.length} photographs</Text><Text style={styles.heading}>{new Date(`${entry.entry_date}T12:00:00`).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</Text><Text style={styles.body}>{entry.body || "No words were saved for this day."}</Text>{entry.photoUrls.length > 0 && <View style={styles.photos}>{entry.photoUrls.slice(0, 3).map((url) => <Image key={url} src={url} style={styles.photo}/>)}</View>}<View style={styles.rule}/></View>)}</Page></Document>;
  const buffer = await renderToBuffer(document);
  return new NextResponse(new Uint8Array(buffer), { headers: { "content-type": "application/pdf", "content-disposition": 'attachment; filename="my-daymark.pdf"' } });
}
