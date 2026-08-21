import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'

interface PaginaProximamenteProps {
  titulo: string
}

export default function PaginaProximamente({ titulo }: PaginaProximamenteProps) {
  return (
    <Paper sx={{ p: { xs: 4, md: 8 }, textAlign: 'center' }}>
      <Typography variant="overline" color="text.secondary">
        Módulo de {titulo}
      </Typography>
      <Typography variant="h4" component="h1" gutterBottom>
        Próximamente
      </Typography>
      <Typography variant="body1" color="text.secondary">
        La sección «{titulo}» todavía no fue implementada.
      </Typography>
    </Paper>
  )
}
