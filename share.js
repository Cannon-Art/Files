/**
 * Share links for individual pictures.
 *
 * protection.js blocks right-click and copying, and canvas-protection.js
 * replaces each picture with a canvas, so visitors cannot copy a page or
 * picture address in the usual way. This adds deliberate share controls
 * instead, so links can be sent to other platforms without loosening the
 * protection on the artwork itself.
 *
 * Each .gallery-item carries an id (the picture's id from gallery-data.json),
 * which gives every picture its own address: page.html#dc-001. Opening that
 * address scrolls to the picture and highlights it.
 *
 * Two links are offered per picture:
 *  - Page link: the gallery page, scrolled to this picture (best for posts,
 *    since it brings people to the site).
 *  - Picture link: the image file itself (for platforms that want a direct
 *    image address).
 */
(function () {
    'use strict';

    function pageLinkFor(item) {
        const base = window.location.href.split('#')[0];
        return item.id ? `${base}#${item.id}` : base;
    }

    function pictureLinkFor(item) {
        const media = item.querySelector('.gallery-image');
        if (!media) return '';
        // canvas-protection.js keeps the original address on the canvas.
        return media.dataset.originalSrc || media.currentSrc || media.src || '';
    }

    function titleFor(item) {
        const title = item.querySelector('.gallery-title');
        return title ? title.textContent.trim() : document.title;
    }

    // navigator.clipboard needs https (the live site) or localhost. The
    // fallback covers older browsers; it uses a temporary text box, which
    // protection.js allows because it lets editable fields copy.
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
    // buttons, already selected, so it can be copied by hand.
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

    function handleCopy(button, link) {
        if (!link) {
            flash(button, 'No link found');
            return;
        }
        copyText(link).then(
            function () { flash(button, 'Link copied'); },
            function () {
                flash(button, 'Copy the link below');
                showLink(button.parentNode, link);
            }
        );
    }

    function addShareControls(item) {
        if (item.querySelector('.share-controls')) return;
        const info = item.querySelector('.gallery-info');
        if (!info) return;

        const bar = document.createElement('div');
        bar.className = 'share-controls';

        // Phones and some desktop browsers have a native share sheet that
        // goes straight to Messages, WhatsApp, Facebook and so on.
        if (navigator.share) {
            const share = document.createElement('button');
            share.type = 'button';
            share.className = 'share-btn';
            share.textContent = 'Share';
            share.addEventListener('click', function () {
                navigator.share({
                    title: titleFor(item),
                    text: `${titleFor(item)} by Cannon Art`,
                    url: pageLinkFor(item)
                }).catch(function () { /* closed by the visitor */ });
            });
            bar.appendChild(share);
        }

        const page = document.createElement('button');
        page.type = 'button';
        page.className = 'share-btn';
        page.textContent = 'Copy page link';
        page.addEventListener('click', function () {
            handleCopy(page, pageLinkFor(item));
        });
        bar.appendChild(page);

        const picture = document.createElement('button');
        picture.type = 'button';
        picture.className = 'share-btn';
        picture.textContent = 'Copy picture link';
        picture.addEventListener('click', function () {
            handleCopy(picture, pictureLinkFor(item));
        });
        bar.appendChild(picture);

        info.appendChild(bar);
    }

    // Opening page.html#picture-id brings that picture into view.
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
        document.querySelectorAll('.gallery-item').forEach(addShareControls);
        focusLinkedPicture();
        window.addEventListener('hashchange', focusLinkedPicture);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
