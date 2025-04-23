
import HydrationTracker from "@/components/waterCom";
import Head from "next/head";

export default function Home() {

  return (
   <>
   <Head>
   <title>Hydration Water</title>
    <meta name="description" content="Hydration Water" />
   </Head>
   <main>
   <div>
    <HydrationTracker/>
   </div>
    </main>
   </>

  );
}
