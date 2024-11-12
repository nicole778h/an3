import { Animation, createAnimation } from '@ionic/react';

export const enterAnimation = (baseEl: HTMLElement): Animation => {
    const backdropAnimation = createAnimation()
        .addElement(baseEl.querySelector('ion-backdrop')!)
        .fromTo('opacity', '0.01', 'var(--backdrop-opacity)');

    const wrapperAnimation = createAnimation()
        .addElement(baseEl.querySelector('.modal-wrapper')!)
        .keyframes([
            { offset: 0, opacity: '0', transform: 'translateY(100%)' },
            { offset: 1, opacity: '1', transform: 'translateY(0)' },
        ]);

    return createAnimation()
        .addElement(baseEl)
        .easing('ease-out')
        .duration(500)
        .addAnimation([backdropAnimation, wrapperAnimation]);
};

export const leaveAnimation = (baseEl: HTMLElement): Animation => {
    const backdropAnimation = createAnimation()
        .addElement(baseEl.querySelector('ion-backdrop')!)
        .fromTo('opacity', 'var(--backdrop-opacity)', '0.01');

    const wrapperAnimation = createAnimation()
        .addElement(baseEl.querySelector('.modal-wrapper')!)
        .keyframes([
            { offset: 0, opacity: '1', transform: 'translateY(0)' },
            { offset: 1, opacity: '0', transform: 'translateY(100%)' },
        ]);

    return createAnimation()
        .addElement(baseEl)
        .easing('ease-in')
        .duration(500)
        .addAnimation([backdropAnimation, wrapperAnimation]);
};
