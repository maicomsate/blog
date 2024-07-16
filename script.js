let posts = [];
let currentUser = null;

// Funções de autenticação
function login(email, password) {
    // Simulação de login (em um cenário real, isso seria verificado no servidor)
    currentUser = { email, name: email.split('@')[0] };
    updateAuthUI();
}

function register(name, email, password) {
    // Simulação de registro (em um cenário real, isso seria salvo no servidor)
    currentUser = { email, name };
    updateAuthUI();
}

function logout() {
    currentUser = null;
    updateAuthUI();
}

function updateAuthUI() {
    const authSection = document.getElementById('auth');
    const newPostSection = document.getElementById('new-post');
    if (currentUser) {
        authSection.classList.add('hidden');
        newPostSection.classList.remove('hidden');
    } else {
        authSection.classList.remove('hidden');
        newPostSection.classList.add('hidden');
    }
    renderPosts();
}

// Event listeners para formulários de autenticação
document.querySelector('#login-form form').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = this.querySelector('input[type="email"]').value;
    const password = this.querySelector('input[type="password"]').value;
    login(email, password);
});

document.querySelector('#register-form form').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = this.querySelector('input[type="text"]').value;
    const email = this.querySelector('input[type="email"]').value;
    const password = this.querySelector('input[type="password"]').value;
    register(name, email, password);
});

// Funções do blog
document.getElementById('post-form').addEventListener('submit', function(e) {
    e.preventDefault();
    if (!currentUser) return;
    const title = document.getElementById('post-title').value;
    const content = document.getElementById('post-content').value;
    const imageFile = document.getElementById('post-image').files[0];

    if (imageFile) {
        const reader = new FileReader();
        reader.onload = function(event) {
            addPost(title, content, event.target.result);
        };
        reader.readAsDataURL(imageFile);
    } else {
        addPost(title, content);
    }

    e.target.reset();
});

function addPost(title, content, imageUrl = null) {
    const post = {
        id: Date.now(),
        title,
        content,
        imageUrl,
        author: currentUser.name,
        likes: 0,
        comments: []
    };
    posts.unshift(post);
    renderPosts();
}

function renderPosts() {
    const postsContainer = document.getElementById('posts');
    postsContainer.innerHTML = posts.map(post => `
        <div class="post" id="post-${post.id}">
            <h2>${post.title}</h2>
            <p>Por ${post.author}</p>
            ${post.imageUrl ? `<img src="${post.imageUrl}" alt="${post.title}">` : ''}
            <p>${post.content}</p>
            <button onclick="likePost(${post.id})" class="like-button">Like (${post.likes})</button>
            ${currentUser && currentUser.name === post.author ? `<button onclick="deletePost(${post.id})" class="delete-button">Excluir Postagem</button>` : ''}
            <div class="comments">
                <h3>Comentários</h3>
                ${post.comments.map(comment => `
                    <div class="comment" id="comment-${comment.id}">
                        <p><strong>${comment.author}:</strong> ${comment.content}</p>
                        <button onclick="likeComment(${post.id}, ${comment.id})" class="like-button">Like (${comment.likes})</button>
                        <button onclick="showReplyForm(${post.id}, ${comment.id})" class="reply-button">Responder</button>
                        ${currentUser && currentUser.name === comment.author ? `<button onclick="deleteComment(${post.id}, ${comment.id})" class="delete-button">Excluir</button>` : ''}
                        <div id="reply-form-${comment.id}" class="reply-form hidden">
                            <input type="text" placeholder="Sua resposta">
                            <button onclick="addReply(${post.id}, ${comment.id})">Enviar Resposta</button>
                        </div>
                        <div class="replies">
                            ${comment.replies ? comment.replies.map(reply => `
                                <div class="reply">
                                    <p><strong>${reply.author}:</strong> ${reply.content}</p>
                                </div>
                            `).join('') : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
            ${currentUser ? `
                <form onsubmit="addComment(event, ${post.id})">
                    <input type="text" placeholder="Adicione um comentário" required>
                    <button type="submit">Comentar</button>
                </form>
            ` : ''}
        </div>
    `).join('');
}

function likePost(postId) {
    if (!currentUser) return;
    const post = posts.find(p => p.id === postId);
    if (post) {
        post.likes++;
        renderPosts();
    }
}

function deletePost(postId) {
    if (!currentUser) return;
    posts = posts.filter(post => post.id !== postId);
    renderPosts();
}

function addComment(event, postId) {
    event.preventDefault();
    if (!currentUser) return;
    const commentInput = event.target.querySelector('input');
    const content = commentInput.value;
    const post = posts.find(p => p.id === postId);
    if (post) {
        post.comments.push({
            id: Date.now(),
            author: currentUser.name,
            content,
            likes: 0,
            replies: []
        });
        renderPosts();
    }
    commentInput.value = '';
}

function likeComment(postId, commentId) {
    if (!currentUser) return;
    const post = posts.find(p => p.id === postId);
    if (post) {
        const comment = post.comments.find(c => c.id === commentId);
        if (comment) {
            comment.likes++;
            renderPosts();
        }
    }
}

function deleteComment(postId, commentId) {
    if (!currentUser) return;
    const post = posts.find(p => p.id === postId);
    if (post) {
        post.comments = post.comments.filter(c => c.id !== commentId);
        renderPosts();
    }
}

function showReplyForm(postId, commentId) {
    if (!currentUser) return;
    const replyForm = document.getElementById(`reply-form-${commentId}`);
    replyForm.classList.toggle('hidden');
}

function addReply(postId, commentId) {
    if (!currentUser) return;
    const replyInput = document.querySelector(`#reply-form-${commentId} input`);
    const content = replyInput.value;
    const post = posts.find(p => p.id === postId);
    if (post) {
        const comment = post.comments.find(c => c.id === commentId);
        if (comment) {
            if (!comment.replies) comment.replies = [];
            comment.replies.push({
                id: Date.now(),
                author: currentUser.name,
                content
            });
            renderPosts();
        }
    }
    replyInput.value = '';
}

// Inicialização
updateAuthUI();
renderPosts();