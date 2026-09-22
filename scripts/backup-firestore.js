/**
 * Backup manual do Firestore — TLGestão
 * ---------------------------------------------------------------
 * Exporta todas as coleções do banco para arquivos .json locais.
 * Não usa Cloud Functions nem Cloud Scheduler, então funciona
 * mesmo no plano gratuito (Spark) do Firebase — o custo é zero.
 *
 * Rode manualmente sempre que quiser um "retrato" dos dados:
 *   npm run backup
 *
 * Pré-requisito (só precisa fazer uma vez):
 *  1. No Firebase Console, vá em
 *     Configurações do projeto > Contas de serviço > Gerar nova chave privada
 *  2. Salve o arquivo baixado como "serviceAccountKey.json" na raiz do
 *     projeto (mesma pasta do package.json).
 *  3. Garanta que "serviceAccountKey.json" está no .gitignore
 *     (NUNCA suba esse arquivo para o GitHub — ele dá acesso total ao banco).
 *
 * Veja o passo a passo completo em docs/BACKUP.md
 */

import { readFileSync, mkdirSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const serviceAccountPath = path.join(rootDir, "serviceAccountKey.json");

// Todas as coleções de nível superior usadas pelo app
// (mantenha esta lista alinhada com src/firebase/collections.js)
const COLLECTIONS_TO_BACKUP = [
    "businesses",
    "clients",
    "services",
    "products",
    "appointments",
    "sales",
    "saleItems",
    "transactions",
    "notifications",
    "activityLogs",
    "adminLogs",
    "systemConfig",
];

function fail(message) {
    console.error(`\n❌ ${message}\n`);
    process.exit(1);
}

if (!existsSync(serviceAccountPath)) {
    fail(
        "Não encontrei o arquivo serviceAccountKey.json na raiz do projeto.\n" +
        "   Veja como gerá-lo em docs/BACKUP.md antes de rodar 'npm run backup'."
    );
}

const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf8"));

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

function timestampFolderName() {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return (
        `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}` +
        `_${pad(now.getHours())}-${pad(now.getMinutes())}`
    );
}

async function backupCollection(collectionName, outputDir) {
    const snapshot = await db.collection(collectionName).get();

    const docs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    }));

    const outputPath = path.join(outputDir, `${collectionName}.json`);
    writeFileSync(outputPath, JSON.stringify(docs, null, 2), "utf8");

    return docs.length;
}

async function run() {
    const folderName = timestampFolderName();
    const outputDir = path.join(rootDir, "backups", folderName);
    mkdirSync(outputDir, { recursive: true });

    console.log(`\n📦 Iniciando backup do Firestore em: backups/${folderName}\n`);

    let totalDocs = 0;
    for (const collectionName of COLLECTIONS_TO_BACKUP) {
        try {
            const count = await backupCollection(collectionName, outputDir);
            totalDocs += count;
            console.log(`  ✔ ${collectionName}: ${count} documento(s)`);
        } catch (error) {
            console.warn(`  ⚠ ${collectionName}: falhou (${error.message})`);
        }
    }

    console.log(
        `\n✅ Backup concluído! ${totalDocs} documentos salvos em backups/${folderName}\n` +
        `   Dica: copie essa pasta para o Google Drive ou outro lugar seguro,\n` +
        `   fora do computador, de tempos em tempos.\n`
    );
    process.exit(0);
}

run().catch((error) => {
    fail(`Erro inesperado durante o backup: ${error.message}`);
});
