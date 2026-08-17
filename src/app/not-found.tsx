import Link from "next/link";

export default function NotFound() {
  return (
    <section className="section">
      <h1>That job is not on the desk.</h1>
      <p className="lede">It may have been a local file that did not survive a restart.</p>
      <Link href="/start" className="btn-solid">
        Open a new job
      </Link>
    </section>
  );
}
