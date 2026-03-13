import { generateWAMessageFromContent, proto, prepareWAMessageMedia } from '@whiskeysockets/baileys';
import fs from 'fs';

export default {
    cmd: ["pay"],
    category: "store",

    run: async (m, { sock, command }) => {
        
        if (command === "pay") {
            const qrisPath = './assets/qris.jpg';

            if (!fs.existsSync(qrisPath)) {
                return m.reply("❌ File assets/qris.jpg tidak ditemukan.");
            }

            // Menyiapkan media (foto) untuk dikirim di header tombol
            const media = await prepareWAMessageMedia({ 
                image: fs.readFileSync(qrisPath) 
            }, { upload: sock.waUploadToServer });

            const msg = generateWAMessageFromContent(m.from, { 
                viewOnceMessage: { 
                    message: { 
                        interactiveMessage: proto.Message.InteractiveMessage.fromObject({ 
                            body: { text: "PAYMENT" }, 
                            footer: { text: "Klik tombol dibawah untuk copy nomor ewallet" },
                            header: {
                                title: "QRIS PAYMENT", // Judul di atas gambar
                                hasMediaAttachment: true,
                                imageMessage: media.imageMessage
                            },
                            nativeFlowMessage: { 
                                buttons: [
                                    { 
                                        name: "cta_copy", 
                                        buttonParamsJson: JSON.stringify({ 
                                            display_text: "Salin DANA", 
                                            id: "copy_dana", 
                                            copy_code: "08777777777" 
                                        }) 
                                    },
                                    { 
                                        name: "cta_copy", 
                                        buttonParamsJson: JSON.stringify({ 
                                            display_text: "Salin GOPAY", 
                                            id: "copy_gopay", 
                                            copy_code: "08777777777" 
                                        }) 
                                    }
                                ] 
                            } 
                        }) 
                    } 
                } 
            }, { userJid: sock.user.id, quoted: m }); 

            await sock.relayMessage(m.from, msg.message, { 
                messageId: msg.key.id, 
                additionalNodes: [
                    { 
                        tag: "biz", 
                        attrs: {}, 
                        content: [
                            { 
                                tag: "interactive", 
                                attrs: { type: "native_flow", v: "1" }, 
                                content: [
                                    { tag: "native_flow", attrs: { v: "9", name: "mixed" } }
                                ] 
                            }
                        ] 
                    }
                ] 
            });
        }
    }
}