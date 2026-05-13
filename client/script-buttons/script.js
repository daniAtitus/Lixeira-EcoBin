function mostrar(idDiv){

    const conteudo = document.getElementById('conteudo');
    const formLixeira = document.getElementById('form-lixeira');
    const formUsuario = document.getElementById('form-usuario')
    const mapa = document.getElementById('mapa-central')

    conteudo.classList.remove('ativa');
    formLixeira.classList.remove('ativa-lixeira');
    formUsuario.classList.remove('ativa-usuario');
    mapa.classList.remove('ativa-mapa')

    if(idDiv === 'conteudo'){
        conteudo.classList.add('ativa');
    }

    if(idDiv === 'form-lixeira'){
        formLixeira.classList.add('ativa-lixeira');
    }   
    if(idDiv === 'form-usuario'){
        formUsuario.classList.add('ativa-usuario');
    }
    if(idDiv === 'mapa-central'){
        mapa.classList.add('ativa-mapa')
    }
}