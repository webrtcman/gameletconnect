import { AnimationTriggerMetadata, trigger, animate, state, useAnimation, style, transition, keyframes, animation, AnimationReferenceMetadata } from "@angular/animations";


//#region Elliptic Slide

export function ellipticSlide(): AnimationTriggerMetadata {
    return trigger('ellipticslide', [
        transition(':enter',
            useAnimation(ellipticSlideInAnimation())
        ),
        transition(':leave',
            useAnimation(ellipticSlideOutAnimation())
        ),
    ]);
}

function ellipticSlideInAnimation(): AnimationReferenceMetadata {
    return animation(
        animate('0.6s cubic-bezier(0.250, 0.460, 0.450, 0.940)', keyframes([
            style({
                offset: 0,
                transform: 'translateX(-800px) rotateY(30deg) scale(0)',
                transformOrigin: '-100% 50%',
                opacity: 0
            }),
            style({
                offset: 1,
                transform: 'translateX(0) rotateY(0) scale(1)',
                transformOrigin: '1800px 50%',
                opacity: 1
            })
        ]))
    )
}

function ellipticSlideOutAnimation(): AnimationReferenceMetadata {
    return animation(
        animate('0.6s ease-in', keyframes([
            style({
                offset: 0,
                transform: 'translateX(0) rotateY(0) scale(1)',
                transformOrigin: '-1800px 50%',
                opacity: 1
            }),
            style({
                offset: 1,
                transform: 'translateX(1000px) rotateY(-30deg) scale(0)',
                transformOrigin: '-100% 50%',
                opacity: 0
            })
        ]))
    )
}

//#endregion

//#region growShrink

export function growShrink(): AnimationTriggerMetadata {
    return trigger('growShrink', [
        transition(':enter',
            useAnimation(growAnimation())
        ),
        transition(':leave', [
            useAnimation(shrinkAnimation())
        ]),
    ]);
}

function growAnimation(): AnimationReferenceMetadata {
    return animation(
        animate('{{ duration }} {{ easing }}', keyframes([
            style({
                offset: 0,
                transform: 'scale(0.2) translateY(250px)',
                opacity: 0
            }),
            style({
                offset: 1,
                transform: 'scale(1) translateY(0)',
                opacity: 1
            })
        ])),
        {
            params: {
                duration: '0.4s',
                easing: 'ease-out'
            }
        }
    )
}

function shrinkAnimation(): AnimationReferenceMetadata {
    return animation(
        animate('{{ duration }} {{ easing }}', keyframes([
            style({
                offset: 0,
                transform: 'scale(1) translateY(0)',
                opacity: 1
            }),
            style({
                offset: 1,
                transform: 'scale(0) translateY(250px)',
                opacity: 0
            })
        ])),
        {
            params: {
                duration: '0.3s',
                easing: 'ease-in'
            }
        }
    )
}

//#endregion
////#region fade

export function fadeInOut(): AnimationTriggerMetadata {
    return trigger('fadeInOut', [
        transition(':enter',
            useAnimation(fadeInAnimation())
        ),
        transition(':leave', [
            useAnimation(fadeOutAnimation())
        ]),
    ]);
}

function fadeInAnimation(): AnimationReferenceMetadata {
    return animation(
        animate('{{ duration }} {{ easing }}', keyframes([
            style({
                offset: 0,
                opacity: 0
            }),
            style({
                offset: 1,
               
                opacity: 1
            })
        ])),
        {
            params: {
                duration: '0.4s',
                easing: 'ease-in'
            }
        }
    )
}

function fadeOutAnimation(): AnimationReferenceMetadata {
    return animation(
        animate('{{ duration }} {{ easing }}', keyframes([
            style({
                offset: 0,
                opacity: 1
            }),
            style({
                offset: 1,
                opacity: 0
            })
        ])),
        {
            params: {
                duration: '0.4s',
                easing: 'ease-in'
            }
        }
    )
}
