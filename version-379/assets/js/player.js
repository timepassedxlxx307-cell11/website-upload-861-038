import { H as Hls } from './hls.js';

function setStatus(element, text) {
    if (element) {
        element.textContent = text;
    }
}

function initPlayer(shell) {
    const video = shell.querySelector('video');
    const button = shell.querySelector('[data-play-button]');
    const status = shell.querySelector('[data-player-status]');
    const source = shell.getAttribute('data-src') || (video ? video.getAttribute('data-src') : '');
    let hls = null;

    if (!video || !button || !source) {
        setStatus(status, '播放源读取失败');
        return;
    }

    const start = async () => {
        shell.classList.add('is-playing');
        setStatus(status, '正在载入播放源');

        if (shell.dataset.ready === 'true') {
            try {
                await video.play();
                setStatus(status, '正在播放');
            } catch (error) {
                setStatus(status, '点击视频画面继续播放');
            }
            return;
        }

        shell.dataset.ready = 'true';

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            try {
                await video.play();
                setStatus(status, '正在播放');
            } catch (error) {
                setStatus(status, '点击视频画面继续播放');
            }
            return;
        }

        if (Hls && Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: false
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, async () => {
                try {
                    await video.play();
                    setStatus(status, '正在播放');
                } catch (error) {
                    setStatus(status, '点击视频画面继续播放');
                }
            });
            hls.on(Hls.Events.ERROR, (event, data) => {
                if (!data || !data.fatal) {
                    return;
                }
                if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                    setStatus(status, '网络波动，正在恢复播放');
                    hls.startLoad();
                } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                    setStatus(status, '媒体解码恢复中');
                    hls.recoverMediaError();
                } else {
                    setStatus(status, '播放源暂时无法播放');
                    hls.destroy();
                }
            });
            return;
        }

        setStatus(status, '当前浏览器不支持 HLS 播放');
    };

    button.addEventListener('click', start);
    video.addEventListener('click', () => {
        if (video.paused) {
            start();
        } else {
            video.pause();
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-video-player]').forEach(initPlayer);
});
