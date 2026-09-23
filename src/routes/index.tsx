import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, CheckCircle2, ClipboardCheck, Cloud, Menu, UserRound, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/reveal";
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
  const [testiScrolled, setTestiScrolled] = useState(false);
  const testiRef = useRef<HTMLDivElement>(null);
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
          <p className="eyebrow mx-auto flex w-fit items-center gap-2">Finanz- & Lohnbuchhaltung für Schweizer KMU</p>
          <h1 className="heading-xl mx-auto mt-6 max-w-[650px] text-center">Ihre Buchhaltung.<br/><span className="text-primary">Persönlich erledigt.</span></h1>
          <p className="mx-auto mt-7 text-center text-[18px] leading-[1.65] text-muted-foreground md:text-[19px]">Wir übernehmen Ihre Finanz- und Lohnbuchhaltung zuverlässig und persönlich.</p>
        </div>
        <div className="section-shell mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"><Button asChild><a href="#kontakt">Unverbindliches Erstgespräch</a></Button><Button variant="outline" asChild><a href="#dienstleistungen">Dienstleistungen ansehen</a></Button></div>
        <div className="mt-8 w-full" aria-label="Abstrakte Bilanz- und Erfolgsrechnungen in Bewegung">
          <StatementMarquee reverse />
        </div>

      </section>



      <section id="dienstleistungen" className="section-pad bg-card"><div className="section-shell"><div className="text-center"><p className="eyebrow">Unsere Dienstleistungen</p><h2 className="heading-lg mt-4">Was wir Ihnen abnehmen.</h2><p className="mt-5 text-[18px] leading-7 text-muted-foreground">Von der laufenden Finanzbuchhaltung bis zur monatlichen Lohnadministration.</p></div>
        <div className="mt-14 grid items-stretch gap-6 lg:grid-cols-2"><Reveal className="h-full"><article className="flex h-full flex-col rounded-[24px] bg-sage-soft p-8 md:p-10"><h3 className="text-[30px] font-semibold">Finanzbuchhaltung</h3><p className="mt-4 leading-7 text-muted-foreground">Wir führen Ihre laufende Buchhaltung sauber, nachvollziehbar und aktuell – damit Ihre finanziellen Informationen jederzeit strukturiert verfügbar sind.</p><div className="my-7 border-t border-border"/>{checks(["Laufende Buchhaltung","Debitoren und Kreditoren","Bankabstimmungen","MWST-Abrechnungen","Monats- und Quartalsabschlüsse"])}<a href="#kontakt" className="mt-8 inline-flex items-center gap-2 font-semibold text-primary lg:mt-auto lg:pt-8">Mehr zur Finanzbuchhaltung <ArrowRight className="size-4"/></a></article></Reveal>
          <Reveal delay={120} className="h-full"><article className="flex h-full flex-col rounded-[24px] bg-primary p-8 text-primary-foreground md:p-10"><h3 className="text-[30px] font-semibold">Lohnbuchhaltung</h3><p className="mt-4 leading-7 text-primary-foreground/75">Wir kümmern uns zuverlässig und diskret um Ihre laufende Lohnadministration – vom monatlichen Lohnlauf bis zu den Jahresendarbeiten.</p><div className="my-7 border-t border-primary-foreground/20"/>{checks(["Monatliche Lohnabrechnungen","Ein- und Austritte","Sozialversicherungen","Lohnausweise","Jahresendarbeiten"], true)}<a href="#kontakt" className="mt-8 inline-flex items-center gap-2 font-semibold lg:mt-auto lg:pt-8">Mehr zur Lohnbuchhaltung <ArrowRight className="size-4"/></a></article></Reveal></div>
      </div></section>


      <section id="team" className="section-pad"><div className="section-shell"><div className="text-center"><p className="eyebrow">Ihre Ansprechpartner</p><h2 className="heading-lg mt-4">Wer steht hinter den Zahlen?</h2><p className="mt-5 text-[18px] leading-7 text-muted-foreground">Ihre Buchhaltung wird persönlich von uns betreut. So wissen Sie jederzeit, an wen Sie sich wenden können.</p></div><div className="mt-14 grid gap-6 md:grid-cols-2">{[["Sarah Mogel","Lohn- und Finanzbuchhalterin","Sarah betreut die laufende Finanz- und Lohnbuchhaltung mit einem klaren Blick für saubere Abläufe. Verlässliche Termine und eine direkte Kommunikation stehen dabei im Mittelpunkt."],["Audelia Babbev-Pittet","Finanzbuchhalterin","Audelia kümmert sich um die strukturierte Führung und Abstimmung der Finanzbuchhaltung. Besonders wichtig ist ihr eine unkomplizierte und langfristige Zusammenarbeit."]].map(([name,role,bio],idx)=><Reveal key={name} delay={idx*120}><article className="overflow-hidden rounded-[24px] border border-border bg-card"><div className="grid aspect-[4/3] place-items-center bg-sage-soft"><div className="text-center"><UserRound className="mx-auto size-12 text-primary/50"/><p className="mt-3 text-sm font-medium text-muted-foreground">Portrait von {name}</p></div></div><div className="p-8"><h3 className="text-[28px] font-semibold">{name}</h3><p className="mt-1 font-semibold text-primary">{role}</p><p className="mt-5 leading-7 text-muted-foreground">{bio}</p></div></article></Reveal>)}</div></div></section>

      <section className="section-pad bg-card"><div className="section-shell"><div className="text-center"><p className="eyebrow">Kundenfeedback</p><h2 className="heading-lg mt-4">Was unsere Kunden über die Zusammenarbeit sagen.</h2></div><Reveal className="mt-12"><div ref={testiRef} className="flex gap-5 overflow-x-auto overflow-y-hidden pb-5" onScroll={(e)=>setTestiScrolled(e.currentTarget.scrollLeft>4)} style={testiScrolled ? undefined : {WebkitMaskImage:"linear-gradient(to right, black calc(100% - 140px), transparent 100%)",maskImage:"linear-gradient(to right, black calc(100% - 140px), transparent 100%)"}}>{[1,2,3,4,5,6].map(x=><div key={x} className="min-w-[min(70vw,310px)]"><article className="h-full rounded-[20px] border border-border bg-background p-8"><p className="text-lg font-medium">Kundenstimme folgt</p><p className="mt-8 text-sm text-muted-foreground">Referenz wird nach Freigabe ergänzt.</p></article></div>)}</div></Reveal></div></section>

      <section id="faq" className="section-pad"><div className="section-shell grid gap-12 lg:grid-cols-[.8fr_1.2fr]"><div className="text-center"><p className="eyebrow">FAQ</p><h2 className="heading-lg mt-4">Häufige Fragen.</h2><p className="mt-5 leading-7 text-muted-foreground">Hier finden Sie Antworten zu Umfang, Zusammenarbeit und Einstieg.</p></div><Accordion type="single" collapsible>{[["Wie sieht eine Zusammenarbeit aus?","1 Kennenlernen – Wir besprechen Ihr Unternehmen, Ihre aktuelle Situation und Ihren Bedarf.\n2 Zusammenarbeit definieren – Wir klären Aufgaben, Zuständigkeiten, Termine und Abläufe.\n3 Laufend betreuen – Wir übernehmen die vereinbarten Aufgaben zuverlässig und bleiben Ihre direkten Ansprechpartnerinnen."],["Wo werden meine Daten gespeichert?","Für den sicheren Austausch und die Speicherung von Dokumenten nutzen wir Proton. Die Daten werden Ende-zu-Ende verschlüsselt und auf Proton-Infrastruktur in der Schweiz bzw. Deutschland gespeichert."],["Muss ich meine gesamte Buchhaltung auslagern?","Nein. Sie können sowohl die gesamte Finanz- oder Lohnbuchhaltung als auch einzelne Aufgaben an uns übertragen. Gemeinsam definieren wir einen Umfang, der zu Ihrem Unternehmen und Ihren bestehenden Abläufen passt."],["Können Sie mit meinem bestehenden Treuhänder zusammenarbeiten?","Ja. Wir können die laufende Buchhaltung vorbereiten und mit Ihrem bestehenden Treuhänder oder Ihrer Revisionsstelle zusammenarbeiten. Die Zuständigkeiten stimmen wir zu Beginn klar miteinander ab."],["Arbeiten Sie vollständig digital?","Ja. Dokumente und Informationen können digital ausgetauscht werden. Dadurch bleiben die Abläufe effizient und Sie können unabhängig von Ihrem Standort mit uns zusammenarbeiten."],["Für welche Unternehmen arbeiten Sie?","Wir richten uns insbesondere an Schweizer KMU und junge Unternehmen, die ihre Finanz- und/oder Lohnbuchhaltung zuverlässig auslagern möchten."]].map(([q,a])=><AccordionItem key={q ?? "faq"} value={q ?? "faq"}><AccordionTrigger className="min-h-[72px] text-left text-base hover:no-underline">{q}</AccordionTrigger><AccordionContent className="max-w-[600px] pb-6 leading-7 text-muted-foreground whitespace-pre-line">{a}</AccordionContent></AccordionItem>)}</Accordion></div></section>

      <section id="kontakt" className="section-pad bg-card"><div className="section-shell grid gap-14 lg:grid-cols-[.8fr_1.2fr]"><div><div className="text-center"><p className="eyebrow">Kontakt</p><h2 className="heading-lg mt-4">Nehmen Sie Kontakt mit uns auf.</h2></div><dl className="mt-10 space-y-6"><div><dt className="text-sm text-muted-foreground">E-Mail</dt><dd className="mt-1 font-semibold"><a href="mailto:info@startsaldo.ch">info@startsaldo.ch</a></dd></div><div><dt className="text-sm text-muted-foreground">Telefon</dt><dd className="mt-1 font-semibold"><a href="tel:+41798989982">079 898 99 82</a></dd></div><div><dt className="text-sm text-muted-foreground">Standort</dt><dd className="mt-1 font-semibold">Einsiedeln SZ, Schweiz</dd></div></dl></div>
        <form className="rounded-[24px] border border-border bg-background p-6 md:p-10" onSubmit={(e)=>{e.preventDefault(); setSent(true)}}><div className="grid gap-5 sm:grid-cols-2">{["Name","Firma","E-Mail","Telefon"].map((label,i)=><label key={label} className="text-sm font-medium">{label}<input required={i===0||i===2} type={i===2?"email":i===3?"tel":"text"} className="mt-2 h-[52px] w-full rounded-[10px] border border-input bg-card px-4 outline-none transition-colors focus:border-primary"/></label>)}</div><label className="mt-6 block text-sm font-medium">Nachricht<textarea className="mt-2 min-h-[140px] w-full resize-y rounded-[10px] border border-input bg-card p-4 outline-none transition-colors focus:border-primary"/></label><Button type="submit" className="mt-6 w-full">Anfrage senden</Button>{sent && <p role="status" className="mt-4 text-center text-sm font-medium text-success">Vielen Dank. Ihre Anfrage wurde erfasst.</p>}<p className="mt-4 text-center text-xs leading-5 text-muted-foreground">Mit dem Absenden stimmen Sie der Bearbeitung Ihrer Angaben zur Kontaktaufnahme zu.</p></form></div></section>

      <footer className="bg-foreground py-12 text-primary-foreground"><div className="section-shell"><div className="grid gap-10 md:grid-cols-3"><div><p className="text-xl font-semibold">StartSaldo</p><p className="mt-3 text-sm leading-6 text-primary-foreground/65">Finanz- & Lohnbuchhaltung für Schweizer KMU.</p></div><nav className="flex flex-col items-start gap-3 text-sm md:mx-auto md:w-fit">{nav.slice(0,4).map(([l,h])=><a key={h} href={h}>{l}</a>)}</nav><div className="text-sm leading-7 md:justify-self-end"><a href="mailto:info@startsaldo.ch">info@startsaldo.ch</a><br/><a href="tel:+41798989982">079 898 99 82</a><br/>Einsiedeln SZ</div></div><div className="mt-10 flex flex-row items-center justify-between gap-4 border-t border-primary-foreground/15 pt-6 text-xs text-primary-foreground/60"><p>© 2026 StartSaldo</p><div className="flex gap-5"><a href="#" onClick={(e)=>e.preventDefault()}>Impressum</a><a href="#" onClick={(e)=>e.preventDefault()}>Datenschutz</a></div></div></div></footer>
    </main>
  );
}
