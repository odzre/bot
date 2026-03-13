import util from 'util'
import { exec } from 'child_process'

export default {
    cmd: ['eval', 'exec'],
    category: 'owner',
    run: async (m, { sock, config, text }) => {
        if (!m.isOwner) return
        if (m.body.startsWith('eval')) {
            try {
                let evaled = await eval(text)
                if (typeof evaled !== 'string') evaled = util.inspect(evaled)
                m.adReply(evaled)
            } catch (e) {
                m.adReply(util.format(e))
            }
        } else if (m.body.startsWith('exec')) {
            exec(text, (err, stdout) => {
                if (err) return m.adReply(util.format(err))
                if (stdout) m.adReply(stdout)
            })
        }
    }
}