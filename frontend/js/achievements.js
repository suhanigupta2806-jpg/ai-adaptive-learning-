const API_BASE_URL = 'http://localhost:5000';

const TOKEN_KEY = 'adaptiveLearnToken';
const USER_KEY = 'adaptiveLearnUser';


/* =========================================================
   BADGE ICONS
   ========================================================= */

const BADGE_ICONS = {
    'first step': '🌱',
    'quiz starter': '📝',
    'quick learner': '⚡',
    'focused student': '🎯',
    'knowledge builder': '🧠',
    'consistency king': '🔥'
};


/* =========================================================
   HELPERS
   ========================================================= */

function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}


function getUser() {
    try {
        return JSON.parse(
            localStorage.getItem(USER_KEY) || 'null'
        );
    } catch {
        return null;
    }
}


/* =========================================================
   LOAD ACHIEVEMENTS
   ========================================================= */

async function loadAchievements() {

    const token = getToken();

    if (!token) {
        window.location.href = 'login.html';
        return;
    }


    const badgeGrid =
        document.getElementById('badgeGrid');

    if (!badgeGrid) {
        console.error(
            'Achievements: badgeGrid not found.'
        );
        return;
    }


    badgeGrid.innerHTML = `
        <div class="loading">
            Loading achievements...
        </div>
    `;


    try {

        const response = await fetch(
            `${API_BASE_URL}/api/misc/badges`,
            {
                method: 'GET',

                headers: {
                    'Authorization':
                        `Bearer ${token}`,

                    'Content-Type':
                        'application/json'
                }
            }
        );


        if (
            response.status === 401 ||
            response.status === 403
        ) {

            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);

            window.location.href = 'login.html';

            return;
        }


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success
        ) {
            throw new Error(
                data.message ||
                'Unable to load achievements.'
            );
        }


        renderAchievements(data);


    } catch (error) {

        console.error(
            'Achievements error:',
            error
        );


        badgeGrid.innerHTML = `
            <div class="error">

                <strong>
                    Unable to load achievements
                </strong>

                <p>
                    ${escapeHtml(
                        error.message
                    )}
                </p>

                <button
                    type="button"
                    onclick="loadAchievements()">
                    Try Again
                </button>

            </div>
        `;
    }
}


/* =========================================================
   RENDER PAGE
   ========================================================= */

function renderAchievements(data) {

    const student =
        data.student || {};


    const badges =
        Array.isArray(data.badges)
            ? data.badges
            : [];


    const xp =
        Number(student.xp || 0);


    const currentStreak =
        Number(
            student.current_streak || 0
        );


    const longestStreak =
        Number(
            student.longest_streak || 0
        );


    const quizCount =
        Number(
            student.quiz_count || 0
        );


    /* -----------------------------------------
       STAT CARDS
       ----------------------------------------- */

    const xpElement =
        document.getElementById('xp');

    if (xpElement) {
        xpElement.textContent =
            xp.toLocaleString();
    }


    const currentStreakElement =
        document.getElementById(
            'currentStreak'
        );

    if (currentStreakElement) {

        currentStreakElement.textContent =
            `${currentStreak} ${
                currentStreak === 1
                    ? 'day'
                    : 'days'
            }`;
    }


    const longestStreakElement =
        document.getElementById(
            'longestStreak'
        );

    if (longestStreakElement) {

        longestStreakElement.textContent =
            `${longestStreak} ${
                longestStreak === 1
                    ? 'day'
                    : 'days'
            }`;
    }


    const quizCountElement =
        document.getElementById(
            'quizCount'
        );

    if (quizCountElement) {
        quizCountElement.textContent =
            quizCount;
    }


    /* -----------------------------------------
       STUDENT NAME
       ----------------------------------------- */

    const profileName =
        document.getElementById(
            'profileName'
        );


    const storedUser =
        getUser();


    if (
        profileName &&
        student.name
    ) {

        profileName.textContent =
            student.name;

    } else if (
        profileName &&
        storedUser &&
        storedUser.name
    ) {

        profileName.textContent =
            storedUser.name;
    }


    /* -----------------------------------------
       NEXT ACHIEVEMENT
       ----------------------------------------- */

    const nextMessage =
        document.getElementById(
            'nextMessage'
        );


    if (nextMessage) {

        const lockedBadges =
            badges
                .filter(
                    badge => !badge.earned
                )
                .sort(
                    (a, b) =>
                        Number(b.progress || 0) -
                        Number(a.progress || 0)
                );


        if (lockedBadges.length > 0) {

            const next =
                lockedBadges[0];


            nextMessage.textContent =
                `You're closest to "${next.badge_name}" — ${Number(next.progress || 0)}% complete.`;

        } else {

            nextMessage.textContent =
                'Amazing! You have unlocked every available achievement.';
        }
    }


    /* -----------------------------------------
       BADGES
       ----------------------------------------- */

    renderBadges(
        badges,
        data.earned_badges || []
    );
}


/* =========================================================
   RENDER BADGES
   ========================================================= */

function renderBadges(
    badges,
    earnedBadges
) {

    const badgeGrid =
        document.getElementById(
            'badgeGrid'
        );


    if (!badgeGrid) {
        return;
    }


    if (!badges.length) {

        badgeGrid.innerHTML = `
            <div class="loading">
                No achievements available yet.
            </div>
        `;

        return;
    }


    badgeGrid.innerHTML =
        badges.map(
            badge => {

                const name =
                    String(
                        badge.badge_name || ''
                    )
                    .trim()
                    .toLowerCase();


                const icon =
                    BADGE_ICONS[name] ||
                    '🏆';


                const earned =
                    Boolean(
                        badge.earned
                    );


                const progress =
                    Math.max(
                        0,
                        Math.min(
                            100,
                            Number(
                                badge.progress || 0
                            )
                        )
                    );


                const current =
                    Number(
                        badge.current || 0
                    );


                const target =
                    Number(
                        badge.target || 0
                    );


                let progressText;


                if (earned) {

                    progressText =
                        'Completed';

                } else {

                    progressText =
                        `${current} / ${target}`;
                }


                /* ---------------------------------
                   EARNED DATE
                   --------------------------------- */

                let earnedDate = '';


                const earnedRecord =
                    earnedBadges.find(
                        item =>
                            Number(
                                item.badge_id
                            ) ===
                            Number(
                                badge.badge_id
                            )
                    );


                if (
                    earned &&
                    earnedRecord &&
                    earnedRecord.earned_at
                ) {

                    earnedDate = `
                        <div class="earned-date">
                            ✓ Earned
                            ${formatDate(
                                earnedRecord.earned_at
                            )}
                        </div>
                    `;
                }


                return `
                    <article
                        class="badge-card ${
                            earned
                                ? 'earned'
                                : 'locked'
                        }">

                        <div class="badge-top">

                            <div class="badge-icon">
                                ${icon}
                            </div>

                            <span class="status">
                                ${
                                    earned
                                        ? '✓ EARNED'
                                        : 'LOCKED'
                                }
                            </span>

                        </div>


                        <h3>
                            ${escapeHtml(
                                badge.badge_name
                            )}
                        </h3>


                        <p>
                            ${escapeHtml(
                                badge.description || ''
                            )}
                        </p>


                        <div class="progress-row">

                            <span>
                                ${escapeHtml(
                                    progressText
                                )}
                            </span>

                            <strong>
                                ${progress}%
                            </strong>

                        </div>


                        <div class="progress">

                            <i
                                style="
                                    width:${progress}%
                                ">
                            </i>

                        </div>


                        ${earnedDate}

                    </article>
                `;
            }
        )
        .join('');
}


/* =========================================================
   DATE FORMAT
   ========================================================= */

function formatDate(value) {

    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return '';
    }


    return date.toLocaleDateString(
        'en-IN',
        {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        }
    );
}


/* =========================================================
   HTML ESCAPE
   ========================================================= */

function escapeHtml(value) {

    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll(
            "'",
            '&#039;'
        );
}


/* =========================================================
   START
   ========================================================= */

document.addEventListener(
    'DOMContentLoaded',
    () => {

        const refreshButton =
            document.getElementById(
                'refreshBtn'
            );


        if (refreshButton) {

            refreshButton.addEventListener(
                'click',
                loadAchievements
            );
        }


        loadAchievements();
    }
);