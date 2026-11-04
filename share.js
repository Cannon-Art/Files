/**
 * Share button for individual pictures.
 *
 * protection.js blocks right-click and copying, and canvas-protection.js
 * replaces each picture with a canvas, so visitors cannot copy a picture's
 * address in the usual way. This adds one deliberate Share button per picture
 * instead, without loosening the protection on the artwork itself.
 *
 * The shared link is the picture file on the site's own address, so whoever
 * opens it sees the picture in their browser's picture viewer.
 *  - Phones, and browsers with a share menu: opens that menu (WhatsApp,
 *    Messages, Facebook and so on) with the picture link.
 *  - Everywhere else: copies the picture link and says "Link copied".
 *
 * Each .gallery-item also carries an id (the picture's id from
 * gallery-data.json), so page.html#dc-001 scrolls to that picture.
 */
(function () {
    'use strict';

    // Pictures are stored in this repository and referenced through
    // raw.githubusercontent.com. GitHub serves larger files from there as
    // "application/octet-stream", which makes browsers download them instead
    // of showing them. The same file on the site's own address is served as an
    // image, so it opens in the browser's picture viewer.
    const RAW_PREFIX = 'https://raw.githubusercontent.com/Cannon-Art/Files/main/';

    function pictureLinkFor(item) {
        const media = item.querySelector('.gallery-image');
        if (!media) return '';
        // canvas-protection.js keeps the original address on the canvas.
        const src = media.dataset.originalSrc || media.currentSrc || media.src || '';
        if (src.indexOf(RAW_PREFIX) === 0) {
            return `${window.location.origin}/${src.slice(RAW_PREFIX.length)}`;
        }
        return src;
    }

    function titleFor(item) {
        const title = item.querySelector('.gallery-title');
        return title ? title.textContent.trim() : document.title;
    }

    // navigator.clipboard needs https (the live site) or localhost. If it is
    // refused, fall back to a temporary text box, which protection.js allows
    // because it lets editable fields copy.
    function copyText(text) {
        if (navigator.clipboard && window.isSecureContext) {
            return navigator.clipboard.writeText(text).catch(function () {
                return copyWithTextBox(text);
            });
        }
        return copyWithTextBox(text);
    }

    function copyWithTextBox(text) {
        return new Promise(function (resolve, reject) {
            const box = document.createElement('textarea');
            box.value = text;
            box.setAttribute('readonly', '');
            box.style.cssText = 'position:fixed;top:0;left:0;opacity:0;';
            document.body.appendChild(box);
            box.focus();
            box.select();
            let ok = false;
            try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
            document.body.removeChild(box);
            ok ? resolve() : reject(new Error('copy failed'));
        });
    }

    function flash(button, message) {
        const original = button.dataset.label || button.textContent;
        button.dataset.label = original;
        button.textContent = message;
        clearTimeout(button._shareTimer);
        button._shareTimer = setTimeout(function () {
            button.textContent = original;
        }, 2000);
    }

    // Last resort when the browser refuses to copy: show the link under the
    // button, already selected, so it can be copied by hand.
    function showLink(bar, link) {
        let box = bar.parentNode.querySelector('.share-link-box');
        if (!box) {
            box = document.createElement('input');
            box.type = 'text';
            box.readOnly = true;
            box.className = 'share-link-box';
            box.setAttribute('aria-label', 'Link to copy');
            bar.parentNode.insertBefore(box, bar.nextSibling);
        }
        box.value = link;
        box.focus();
        box.select();
    }

    function copyLink(button, link) {
        copyText(link).then(
            function () { flash(button, 'Link copied'); },
            function () {
                flash(button, 'Copy the link below');
                showLink(button.parentNode, link);
            }
        );
    }

    function sharePicture(button, item) {
        const link = pictureLinkFor(item);
        if (!link) {
            flash(button, 'No link found');
            return;
        }
        if (navigator.share) {
            navigator.share({
                title: titleFor(item),
                text: `${titleFor(item)} by Cannon Art`,
                url: link
            }).catch(function (err) {
                // Closing the share menu is not an error; anything else
                // (such as no share targets available) falls back to copying.
                if (!err || err.name !== 'AbortError') copyLink(button, link);
            });
            return;
        }
        copyLink(button, link);
    }

    function addShareButton(item) {
        if (item.querySelector('.share-controls')) return;
        const info = item.querySelector('.gallery-info');
        if (!info) return;

        const bar = document.createElement('div');
        bar.className = 'share-controls';

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'share-btn';
        button.textContent = 'Share';
        button.setAttribute('aria-label', `Share ${titleFor(item)}`);
        button.addEventListener('click', function () {
            sharePicture(button, item);
        });
        bar.appendChild(button);

        info.appendChild(bar);
    }

    // page.html#picture-id brings that picture into view.
    function focusLinkedPicture() {
        const id = decodeURIComponent(window.location.hash.slice(1));
        if (!id) return;
        const item = document.getElementById(id);
        if (!item || !item.classList.contains('gallery-item')) return;
        item.scrollIntoView({ behavior: 'smooth', block: 'center' });
        item.classList.add('share-highlight');
        setTimeout(function () { item.classList.remove('share-highlight'); }, 2500);
    }

    function init() {
        document.querySelectorAll('.gallery-item').forEach(addShareButton);
        focusLinkedPicture();
        window.addEventListener('hashchange', focusLinkedPicture);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
