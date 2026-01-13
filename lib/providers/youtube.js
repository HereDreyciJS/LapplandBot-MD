import ytdl from 'ytdl-core'
import ffmpeg from 'fluent-ffmpeg'
import ffmpegPath from 'ffmpeg-static'
import streamifier from 'streamifier'

ffmpeg.setFfmpegPath(ffmpegPath)

export async function localAudio(url) {
  return new Promise((resolve, reject) => {
    const stream = ytdl(url, {
      filter: 'audioonly',
      quality: 'highestaudio',
      highWaterMark: 1 << 25
    })

    const chunks = []

    ffmpeg(stream)
      .audioBitrate(128)
      .format('mp3')
      .on('error', reject)
      .on('end', () => resolve(Buffer.concat(chunks)))
      .pipe(streamifier.createWriteStream(chunks))
  })
}
