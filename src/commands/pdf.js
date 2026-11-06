export default {
  name: 'pdf',
  aliases: ['topdf', 'img2pdf'],
  ownerOnly: true,
  async execute(sock, from, msg) {
    try { await sock.sendMessage(from, { react: { text: '📄', key: msg.key } }) } catch {}

    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
    if (!quoted || (!quoted.imageMessage &&!quoted.conversation &&!msg.message?.imageMessage)) {
      return await sock.sendMessage(from, {
        text: `┏━━━「 📄 ᴘᴅғ 」━━━┓
┃🔵 ʀᴇᴘʟʏ ᴛᴏ ɪᴍᴀɢᴇ
┃🔴 ᴏʀ sᴇɴᴅ ᴛᴇxᴛ
┃🔵.pdf ᴛᴏ ᴄᴏɴᴠᴇʀᴛ
┗━━━━━━━━━━━━┛`
      }, { quoted: msg })
    }

    try {
      const fs = await import('fs')
      const { exec } = await import('child_process')

      let text = msg.message?.extendedTextMessage?.text?.replace(/^\.pdf/, '').trim() || msg.message?.conversation?.replace(/^\.pdf/, '').trim()
      const qText = quoted?.conversation || quoted?.extendedTextMessage?.text

      // CASE 1: Image to PDF
      if (quoted?.imageMessage || msg.message?.imageMessage) {
        const stream = await sock.downloadMediaMessage(
          quoted?.imageMessage? { message: quoted } : { message: msg.message }
        )
        const imgPath = '/tmp/pdf_' + Date.now() + '.jpg'
        const pdfPath = '/tmp/pdf_' + Date.now() + '.pdf'
        fs.writeFileSync(imgPath, stream)

        await new Promise((res, rej) => {
          exec(`ffmpeg -i ${imgPath} ${pdfPath} -y`, (e) => e? rej(e) : res())
        })

        const pdfBuf = fs.readFileSync(pdfPath)
        await sock.sendMessage(from, {
          document: pdfBuf,
          mimetype: 'application/pdf',
          fileName: 'converted.pdf',
          caption: `┏━━━「 ✅ ᴅᴏɴᴇ 」━━━┓
┃🔵 ɪᴍᴀɢᴇ → ᴘᴅғ
┃🔴 sᴜᴄᴄᴇss
┗━━━━━━━━━━━━┛
> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴛʜᴇ ᴄʏʙᴇʀ sᴇᴄᴜʀɪᴛʏ ʙᴏᴛ`
        }, { quoted: msg })

        try { fs.unlinkSync(imgPath); fs.unlinkSync(pdfPath) } catch {}
        try { await sock.sendMessage(from, { react: { text: '✅', key: msg.key } }) } catch {}
        return
      }

      // CASE 2: Text to PDF
      const finalText = text || qText
      if (!finalText) throw new Error('ɴᴏ ᴛᴇxᴛ ғᴏᴜɴᴅ')

      const pdfLib = await import('pdf-lib')
      const { PDFDocument, StandardFonts } = pdfLib
      const pdfDoc = await PDFDocument.create()
      const page = pdfDoc.addPage([595, 842])
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica)

      const lines = finalText.match(/.{1,80}/g) || [finalText]
      let y = 800
      for (const line of lines) {
        if (y < 50) {
          y = 800
          pdfDoc.addPage([595, 842])
        }
        page.drawText(line, { x: 50, y, size: 12, font })
        y -= 20
      }

      const pdfBytes = await pdfDoc.save()

      await sock.sendMessage(from, {
        document: pdfBytes,
        mimetype: 'application/pdf',
        fileName: 'text.pdf',
        caption: `┏━━━「 ✅ ᴅᴏɴᴇ 」━━━┓
┃🔵 ᴛᴇxᴛ → ᴘᴅғ
┃🔴 sᴜᴄᴄᴇss
┗━━━━━━━━━━━━┛
> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴛʜᴇ ᴄʏʙᴇʀ sᴇᴄᴜʀɪᴛʏ ʙᴏᴛ`
      }, { quoted: msg })

      try { await sock.sendMessage(from, { react: { text: '✅', key: msg.key } }) } catch {}

    } catch (e) {
      try { await sock.sendMessage(from, { react: { text: '❌', key: msg.key } }) } catch {}
      await sock.sendMessage(from, {
        text: `┏━━━「 ❌ ᴇʀʀᴏʀ 」━━━┓
┃🔴 ${e.message}
┗━━━━━━━━━━━━┛`
      }, { quoted: msg })
    }
  }
}
