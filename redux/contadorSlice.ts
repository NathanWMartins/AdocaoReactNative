import { createSlice } from '@reduxjs/toolkit';

export const contadorSlice = createSlice({
    name: 'contador',
    initialState: {
        favoritos: 0,
        adotados: 0,
    },
    reducers: {
        incrementarAdotados: (state) => { state.adotados += 1 },
        decrementarAdotados: (state) => { state.adotados -= 1 },
        incrementarFavoritos: (state) => { state.favoritos += 1 },
        decrementarFavoritos: (state) => { state.favoritos -= 1 },
        setAdotados: (state, action) => { state.adotados = action.payload },
        setFavoritos: (state, action) => { state.favoritos = action.payload },
    },
});

export const {
    incrementarAdotados,
    decrementarAdotados,
    incrementarFavoritos,
    decrementarFavoritos,
    setAdotados,
    setFavoritos
} = contadorSlice.actions;
export default contadorSlice.reducer;
