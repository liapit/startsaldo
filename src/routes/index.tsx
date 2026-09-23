import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, CheckCircle2, ClipboardCheck, Cloud, Menu, UserRound, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

// No head() here: the home route inherits title/description/og/twitter from
// __root.tsx, and ships no og:image so serve-time hosting can inject the
// project's social preview (explicit og:image or latest screenshot).
export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "StartSaldo | Finanz- & Lohnbuchhaltung" },
    { name: "description", content: "Persönliche Finanz- und Lohnbuchhaltung für Schweizer KMU, GmbHs, AGs, Startups und Selbstständige." },
    { property: "og:title", content: "StartSaldo | Persönliche Buchhaltung" },
    { property: "og:description", content: "Klare Abläufe. Persönliche Betreuung. Verlässliche Buchhaltung." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ]}),
  component: Index,
});

const statementCards = [
  { title: "Bilanz", rows: ["Aktiven", "Umlaufvermögen", "Anlagevermögen", "Passiven"] },
  { title: "Erfolgsrechnung", rows: ["Betriebsertrag", "Personalaufwand", "Betriebsaufwand", "Ergebnis"] },
  { title: "Bilanz", rows: ["Flüssige Mittel", "Forderungen", "Eigenkapital", "Verbindlichkeiten"] },
  { title: "Erfolgsrechnung", rows: ["Nettoerlös", "Warenaufwand", "Betriebserfolg", "Jahresergebnis"] },
];

function StatementCard({ title, rows, highlighted = false }: { title: string; rows: string[]; highlighted?: boolean }) {
  return (
    <div className={`statement-card ${highlighted ? "statement-card-highlighted" : ""}`} aria-hidden="true">
      <div className="flex items-center justify-between gap-3 border-b border-primary-foreground/15 pb-2">
        <span className="text-[9px] font-semibold uppercase tracking-[0.05em]">{title}</span>
        <span className="size-2 rounded-full bg-sage" />
      </div>
      <div className="mt-2 space-y-1.5">
        {rows.map((row, index) => (
          <div key={row} className="flex items-center justify-between gap-3">
            <span className="text-[8px] text-primary-foreground/65">{row}</span>
            <span className={`h-1 rounded-full bg-primary-foreground/25 ${index % 2 ? "w-8" : "w-11"}`} />
          </div>
        ))}
      </div>
      <div className="mt-auto flex justify-end border-t border-primary-foreground/15 pt-2">
        <span className="h-1.5 w-14 rounded-full bg-sage/60" />
      </div>
    </div>
  );
}

function StatementMarquee({ reverse = false }: { reverse?: boolean }) {
  const cards = Array.from({ length: 12 }).flatMap(() => statementCards);
  const railRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  // Fade cards in/out via their own opacity near the rail edges — no mask,
  // no gradient overlay. Cards keep their look and simply become transparent.
  useEffect(() => {
    const rail = railRef.current;
    const track = trackRef.current;
    if (!rail || !track) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cardEls = Array.from(track.children) as HTMLElement[];
    const fadeWidth = 170;
    let raf = 0;
    const tick = () => {
      const railRect = rail.getBoundingClientRect();
      const rects = cardEls.map((el) => el.getBoundingClientRect());
      cardEls.forEach((el, i) => {
        const rect = rects[i]!;
        const d = Math.min(rect.right - railRect.left, railRect.right - rect.left);
        const t = Math.min(Math.max(d / fadeWidth, 0), 1);
        const eased = t * t * (3 - 2 * t);
        const base = el.classList.contains("statement-card-highlighted") ? 0.68 : 0.5;
        el.style.opacity = (base * eased).toFixed(3);
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="statement-rail" ref={railRef}>
      <div ref={trackRef} className={reverse ? "statement-track statement-track-reverse" : "statement-track"}>
        {cards.map((card, index) => <StatementCard key={`${card.title}-${index}`} {...card} highlighted={index % 4 === 1} />)}
      </div>
    </div>
  );
}

// IMPORTANT: Replace this placeholder. See ./README.md for routing conventions.
function Index() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const nav = [["Dienstleistungen","#dienstleistungen"],["Über uns","#team"],["FAQ","#faq"],["Kontakt","#kontakt"]];
  const checks = (items: string[], light = false) => <ul className="mt-7 space-y-3.5">{items.map((item) => <li key={item} className="flex gap-3 text-[15px] leading-6"><Check className={`mt-1 size-4 shrink-0 ${light ? "text-sage" : "text-success"}`} />{item}</li>)}</ul>;
  return (
    <main className="bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/80 bg-background/95 backdrop-blur-md">
        <div className="section-shell grid h-[78px] grid-cols-[minmax(0,1fr)_auto] items-center gap-3 md:grid-cols-[auto_minmax(0,1fr)_auto] lg:gap-4">
          <a href="#top" className="text-xl font-semibold tracking-[-0.02em]">Start<span className="text-primary">Saldo</span></a>
          <nav className="hidden justify-center gap-4 text-[13.5px] md:flex lg:gap-7 lg:text-[14px]">{nav.map(([label, href]) => <a key={href} href={href} className="whitespace-nowrap font-medium text-muted-foreground transition-colors hover:text-primary">{label}</a>)}</nav>
          <Button asChild className="hidden md:inline-flex"><a href="#kontakt">Erstgespräch</a></Button>
          <button aria-label={menuOpen ? "Menü schliessen" : "Menü öffnen"} className="grid size-11 place-items-center rounded-button border border-border md:hidden" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X/> : <Menu/>}</button>
        </div>
        {menuOpen && <nav className="section-shell flex flex-col border-t border-border py-4 md:hidden">{nav.map(([label, href]) => <a key={href} href={href} onClick={() => setMenuOpen(false)} className="py-3 text-base">{label}</a>)}</nav>}
      </header>

      <section id="top" className="py-16 lg:py-20">
        <div className="section-shell">
          <p className="eyebrow mx-auto flex w-fit items-center gap-2"><span className="size-2 rounded-full bg-sage"/>Finanz- & Lohnbuchhaltung für Schweizer KMU</p>
          <h1 className="heading-xl mx-auto mt-6 max-w-[650px] text-center">Ihre Buchhaltung.<br/><span className="text-primary">Persönlich erledigt.</span></h1>
          <p className="mx-auto mt-7 text-center text-[18px] leading-[1.65] text-muted-foreground md:text-[19px]">Wir übernehmen Ihre Finanz- und Lohnbuchhaltung zuverlässig und persönlich – damit Sie mehr Zeit für Ihr Unternehmen haben.</p>
        </div>
        <div className="section-shell mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"><Button asChild><a href="#kontakt">Unverbindliches Erstgespräch</a></Button><Button variant="outline" asChild><a href="#dienstleistungen">Dienstleistungen ansehen</a></Button></div>
        <div className="mt-8 w-full" aria-label="Abstrakte Bilanz- und Erfolgsrechnungen in Bewegung">
          <StatementMarquee reverse />
        </div>

      </section>



      <section id="dienstleistungen" className="section-pad bg-card"><div className="section-shell"><p className="eyebrow">Unsere Dienstleistungen</p><h2 className="heading-lg mt-4">Was wir Ihnen abnehmen.</h2><p className="mt-5 text-[18px] leading-7 text-muted-foreground">Von der laufenden Finanzbuchhaltung bis zur monatlichen Lohnadministration – klar definiert und passend zu Ihrem Unternehmen.</p>
        <div className="mt-14 grid gap-6 lg:grid-cols-2"><article className="min-h-[560px] rounded-[24px] bg-sage-soft p-8 md:p-10"><p className="text-sm font-semibold text-primary">01</p><h3 className="mt-8 text-[30px] font-semibold">Finanzbuchhaltung</h3><p className="mt-4 leading-7 text-muted-foreground">Wir führen Ihre laufende Buchhaltung sauber, nachvollziehbar und aktuell – damit Ihre finanziellen Informationen jederzeit strukturiert verfügbar sind.</p><div className="my-7 border-t border-border"/>{checks(["Laufende Buchhaltung","Debitoren und Kreditoren","Bankabstimmungen","MWST-Abrechnungen","Monats- und Quartalsabschlüsse"])}<a href="#kontakt" className="mt-8 inline-flex items-center gap-2 font-semibold text-primary">Mehr zur Finanzbuchhaltung <ArrowRight className="size-4"/></a></article>
          <article className="min-h-[560px] rounded-[24px] bg-primary p-8 text-primary-foreground md:p-10"><p className="text-sm font-semibold text-sage">02</p><h3 className="mt-8 text-[30px] font-semibold">Lohnbuchhaltung</h3><p className="mt-4 leading-7 text-primary-foreground/75">Wir kümmern uns zuverlässig und diskret um Ihre laufende Lohnadministration – vom monatlichen Lohnlauf bis zu den Jahresendarbeiten.</p><div className="my-7 border-t border-primary-foreground/20"/>{checks(["Monatliche Lohnabrechnungen","Ein- und Austritte","Sozialversicherungen","Lohnausweise","Jahresendarbeiten"], true)}<a href="#kontakt" className="mt-8 inline-flex items-center gap-2 font-semibold">Mehr zur Lohnbuchhaltung <ArrowRight className="size-4"/></a></article></div>
      </div></section>


      <section id="team" className="section-pad bg-card"><div className="section-shell"><p className="eyebrow">Ihre Ansprechpartner</p><h2 className="heading-lg mt-4">Hinter den Zahlen stehen zwei Menschen.</h2><p className="mt-5 text-[18px] leading-7 text-muted-foreground">Ihre Buchhaltung wird persönlich von uns betreut. So wissen Sie jederzeit, an wen Sie sich wenden können.</p><div className="mt-14 grid gap-6 md:grid-cols-2">{[["Elia Mogel","Lohn- und Finanzbuchhalterin","Elia betreut die laufende Finanz- und Lohnbuchhaltung mit einem klaren Blick für saubere Abläufe. Verlässliche Termine und eine direkte Kommunikation stehen dabei im Mittelpunkt."],["Lisa Pittet","Finanzbuchhalterin","Lisa kümmert sich um die strukturierte Führung und Abstimmung der Finanzbuchhaltung. Besonders wichtig ist ihr eine unkomplizierte und langfristige Zusammenarbeit."]].map(([name,role,bio])=><article key={name} className="overflow-hidden rounded-[24px] border border-border bg-card"><div className="grid aspect-[4/3] place-items-center bg-sage-soft"><div className="text-center"><UserRound className="mx-auto size-12 text-primary/50"/><p className="mt-3 text-sm font-medium text-muted-foreground">Portrait von {name}</p></div></div><div className="p-8"><h3 className="text-[28px] font-semibold">{name}</h3><p className="mt-1 font-semibold text-primary">{role}</p><p className="mt-5 leading-7 text-muted-foreground">{bio}</p></div></article>)}</div></div></section>

      <section className="section-pad"><div className="section-shell"><h2 className="heading-lg">Was unsere Kunden über die Zusammenarbeit sagen.</h2><div className="mt-12 flex snap-x gap-5 overflow-x-auto pb-5">{[1,2,3].map(x=><article key={x} className="min-w-[min(85vw,380px)] snap-start rounded-[20px] border border-border bg-card p-8"><p className="text-lg font-medium">Kundenstimme folgt</p><p className="mt-8 text-sm text-muted-foreground">Referenz wird nach Freigabe ergänzt.</p></article>)}</div></div></section>

      <section id="faq" className="section-pad bg-card"><div className="section-shell grid gap-12 lg:grid-cols-[.8fr_1.2fr]"><div><p className="eyebrow">FAQ</p><h2 className="heading-lg mt-4">Häufige Fragen.</h2><p className="mt-5 leading-7 text-muted-foreground">Hier finden Sie Antworten zu Umfang, Zusammenarbeit und Einstieg.</p></div><Accordion type="single" collapsible>{[["Für welche Unternehmen arbeiten Sie?","Wir unterstützen Schweizer KMU, GmbHs, AGs, Startups und selbstständig Erwerbende."],["Muss ich meine gesamte Buchhaltung auslagern?","Nein. Sie können auch einzelne klar definierte Aufgaben an uns übergeben."],["Arbeiten Sie vollständig digital?","Wir gestalten den Dokumenten- und Informationsaustausch effizient digital und stimmen den Ablauf mit Ihnen ab."],["Können Sie mit meinem bestehenden Treuhänder zusammenarbeiten?","Ja. Wir können die laufenden Arbeiten übernehmen und strukturiert mit Ihrem Treuhänder oder Ihrer Revisionsstelle zusammenarbeiten."],["Wie beginnt die Zusammenarbeit?","Mit einem unverbindlichen Gespräch. Danach definieren wir Aufgaben, Zuständigkeiten, Termine und den Informationsaustausch."],["Welche Buchhaltungssoftware verwenden Sie?","Die passende Software und bestehende Systeme besprechen wir im Erstgespräch."]].map(([q,a])=><AccordionItem key={q ?? "faq"} value={q ?? "faq"}><AccordionTrigger className="min-h-[72px] text-left text-base hover:no-underline">{q}</AccordionTrigger><AccordionContent className="max-w-[600px] pb-6 leading-7 text-muted-foreground">{a}</AccordionContent></AccordionItem>)}</Accordion></div></section>

      <section id="kontakt" className="section-pad"><div className="section-shell grid gap-14 lg:grid-cols-[.8fr_1.2fr]"><div><p className="eyebrow">Kontakt</p><h2 className="heading-lg mt-4">Nehmen Sie Kontakt mit uns auf.</h2><dl className="mt-10 space-y-6"><div><dt className="text-sm text-muted-foreground">E-Mail</dt><dd className="mt-1 font-semibold"><a href="mailto:info@startsaldo.ch">info@startsaldo.ch</a></dd></div><div><dt className="text-sm text-muted-foreground">Telefon</dt><dd className="mt-1 font-semibold"><a href="tel:+41798989982">079 898 99 82</a></dd></div><div><dt className="text-sm text-muted-foreground">Standort</dt><dd className="mt-1 font-semibold">Einsiedeln SZ, Schweiz</dd></div></dl></div>
        <form className="rounded-[24px] border border-border bg-card p-6 md:p-10" onSubmit={(e)=>{e.preventDefault(); setSent(true)}}><div className="grid gap-5 sm:grid-cols-2">{["Name","Firma","E-Mail","Telefon"].map((label,i)=><label key={label} className="text-sm font-medium">{label}<input required={i===0||i===2} type={i===2?"email":i===3?"tel":"text"} className="mt-2 h-[52px] w-full rounded-[10px] border border-input bg-card px-4 outline-none transition-colors focus:border-primary"/></label>)}</div><label className="mt-6 block text-sm font-medium">Nachricht<textarea className="mt-2 min-h-[140px] w-full resize-y rounded-[10px] border border-input bg-card p-4 outline-none transition-colors focus:border-primary"/></label><Button type="submit" className="mt-6 w-full">Anfrage senden</Button>{sent && <p role="status" className="mt-4 text-center text-sm font-medium text-success">Vielen Dank. Ihre Anfrage wurde erfasst.</p>}<p className="mt-4 text-center text-xs leading-5 text-muted-foreground">Mit dem Absenden stimmen Sie der Bearbeitung Ihrer Angaben zur Kontaktaufnahme zu.</p></form></div></section>

      <footer className="bg-foreground py-12 text-primary-foreground"><div className="section-shell"><div className="grid gap-10 md:grid-cols-3"><div><p className="text-xl font-semibold">StartSaldo</p><p className="mt-3 max-w-[280px] text-sm leading-6 text-primary-foreground/65">Finanz- & Lohnbuchhaltung für Schweizer Unternehmen.</p></div><nav className="flex flex-col gap-3 text-sm">{nav.slice(0,4).map(([l,h])=><a key={h} href={h}>{l}</a>)}</nav><div className="text-sm leading-7"><a href="mailto:info@startsaldo.ch">info@startsaldo.ch</a><br/><a href="tel:+41798989982">079 898 99 82</a><br/>Einsiedeln SZ</div></div><div className="mt-10 flex flex-col gap-4 border-t border-primary-foreground/15 pt-6 text-xs text-primary-foreground/60 sm:flex-row sm:justify-between"><p>© 2026 StartSaldo</p><div className="flex gap-5"><a href="#">Impressum</a><a href="#">Datenschutz</a></div></div></div></footer>
    </main>
  );
}
