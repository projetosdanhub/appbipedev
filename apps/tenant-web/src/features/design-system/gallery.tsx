"use client";
import { useState } from "react";
import {
  MessageSquare,
  Users,
  Briefcase,
  Zap,
  Plus,
  Download,
  SlidersHorizontal,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Checkbox,
  Radio,
  Switch,
  Input,
  PasswordInput,
  Textarea,
  Select,
  OtpInput,
  SearchField,
  Combobox,
  MetricCard,
  PageContainer,
  PageHeader,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  Drawer,
  DrawerTrigger,
  DrawerContent,
  EmptyState,
  ErrorState,
  IntegrationStatusBadge,
  LastCheckedLabel,
  Progress,
  Skeleton,
  DataTable,
  Pagination,
  FileUpload,
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  ConfirmDialog,
  FilterBar,
} from "@bipesend/ui";
import { DashboardShell } from "@/features/workspace/dashboard-shell";

const samples = [
  { id: "a", name: "Empresa de exemplo A", stage: "Novo contato" },
  { id: "b", name: "Empresa de exemplo B", stage: "Em conversa" },
  { id: "c", name: "Empresa de exemplo C", stage: "Proposta" },
];
export function DesignSystemGallery() {
  const [query, setQuery] = useState(""),
    [search, setSearch] = useState(""),
    [selected, setSelected] = useState<string[]>([]),
    [stage, setStage] = useState("new"),
    [code, setCode] = useState(""),
    [confirm, setConfirm] = useState(false),
    [notice, setNotice] = useState(""),
    [page, setPage] = useState(1);
  const [sort, setSort] = useState<{ id: string; direction: "asc" | "desc" }>({
    id: "name",
    direction: "asc",
  });
  const rows = samples
    .filter((row) => row.name.toLowerCase().includes(search.toLowerCase()))
    .toSorted(
      (a, b) =>
        a.name.localeCompare(b.name) * (sort.direction === "asc" ? 1 : -1),
    );
  return (
    <DashboardShell user={{ 
      name: "Catálogo de componentes",
      activeTenant: { id: "a", name: "Exemplo", slug: "exemplo", role: "owner" },
      availableTenants: []
    }}>
      <PageContainer>
        <PageHeader
          title="Design system BipeSend"
          description="Referência interativa para construir experiências consistentes. Todos os dados desta página são exemplos."
          actions={
            <>
              <Badge variant="info">Fundação clara v2</Badge>
            </>
          }
        />
        <div className="ui-grid-metrics">
          <MetricCard
            label="Conversas"
            value="128"
            description="Exemplo de métrica"
            icon={<MessageSquare className="ui-icon" />}
          />
          <MetricCard
            label="Oportunidades"
            value="32"
            description="Exemplo de métrica"
            icon={<Briefcase className="ui-icon" />}
          />
          <MetricCard
            label="Contatos"
            value="1.240"
            description="Exemplo de métrica"
            icon={<Users className="ui-icon" />}
          />
          <MetricCard
            label="Automações"
            value="—"
            description="Sem dados disponíveis"
            icon={<Zap className="ui-icon" />}
          />
        </div>
        <Tabs defaultValue="components">
          <TabsList aria-label="Seções do design system">
            <TabsTrigger value="components">Componentes</TabsTrigger>
            <TabsTrigger value="data">Dados e listas</TabsTrigger>
            <TabsTrigger value="states">Estados</TabsTrigger>
          </TabsList>
          <TabsContent value="components">
            <div className="workspace-home-columns">
              <Card>
                <CardHeader>
                  <CardTitle>Ações e decisões</CardTitle>
                  <CardDescription>
                    Uma ação principal por contexto, foco visível e feedback
                    consistente.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FilterBar>
                    <Button size="md">
                      <Plus aria-hidden="true" />
                      Criar contato
                    </Button>
                    <Button variant="outline" size="md">
                      <Download aria-hidden="true" />
                      Exportar
                    </Button>
                    <Button variant="ghost" size="md">
                      Secundária
                    </Button>
                    <Button size="md" disabled>
                      Indisponível
                    </Button>
                    <Button size="md" isLoading>
                      Salvando
                    </Button>
                  </FilterBar>
                  <div className="ui-separator" />
                  <FilterBar>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="md">
                          Abrir modal
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogTitle>Novo contato</DialogTitle>
                        <DialogDescription>
                          Exemplo de formulário em modal com foco gerenciado.
                        </DialogDescription>
                        <Input
                          label="Nome do contato"
                          placeholder="Nome completo"
                        />
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button variant="outline" size="md">
                              Cancelar
                            </Button>
                          </DialogClose>
                          <DialogClose asChild>
                            <Button size="md">Concluir exemplo</Button>
                          </DialogClose>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Drawer>
                      <DrawerTrigger asChild>
                        <Button variant="outline" size="md">
                          Abrir painel lateral
                        </Button>
                      </DrawerTrigger>
                      <DrawerContent>
                        <DialogTitle>Filtros</DialogTitle>
                        <DialogDescription>
                          Refine sua visualização por etapa.
                        </DialogDescription>
                        <Select label="Etapa">
                          <option>Todos</option>
                          <option>Novo contato</option>
                        </Select>
                      </DrawerContent>
                    </Drawer>
                    <Button
                      variant="destructive"
                      size="md"
                      onClick={() => setConfirm(true)}
                    >
                      Excluir exemplo
                    </Button>
                    <ConfirmDialog
                      open={confirm}
                      onOpenChange={setConfirm}
                      title="Excluir registro de exemplo?"
                      description="Esta demonstração não altera dados da conta."
                      confirmLabel="Excluir exemplo"
                      onConfirm={() => {
                        setConfirm(false);
                        setNotice("Exemplo concluído.");
                      }}
                    />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="md">
                          <SlidersHorizontal aria-hidden="true" />
                          Mais ações
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onSelect={() =>
                            setNotice("Ação de exemplo selecionada.")
                          }
                        >
                          Ação de exemplo
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="md">
                            Ajuda contextual
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          Ajuda complementar; o controle já tem nome acessível.
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </FilterBar>
                  <p className="ui-help" role="status">
                    {notice}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Formulários</CardTitle>
                  <CardDescription>
                    Labels persistentes e validação próxima ao campo.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <Input label="Nome" placeholder="Ex.: Ana Silva" />
                    <Input
                      label="E-mail"
                      type="email"
                      defaultValue="contato"
                      errorMessage="Informe um e-mail válido."
                    />
                    <PasswordInput
                      label="Senha"
                      autoComplete="new-password"
                      helperText="9 caracteres e um símbolo, conforme a política atual."
                    />
                    <Combobox
                      label="Etapa do contato"
                      options={[
                        { value: "new", label: "Novo contato" },
                        { value: "progress", label: "Em conversa" },
                        { value: "won", label: "Concluído" },
                      ]}
                      value={stage}
                      onValueChange={setStage}
                    />
                    <FilterBar>
                      <Checkbox label="Receber atualizações" />
                      <Switch label="Ativar notificações" />
                    </FilterBar>
                    <fieldset>
                      <legend className="ui-label">
                        Preferência de atendimento
                      </legend>
                      <FilterBar>
                        <Radio
                          label="Manual"
                          name="example-mode"
                          defaultChecked
                        />
                        <Radio label="Assistido" name="example-mode" />
                      </FilterBar>
                    </fieldset>
                    <OtpInput
                      label="Código de exemplo"
                      value={code}
                      onValueChange={setCode}
                    />
                    <Textarea
                      label="Observações"
                      placeholder="Adicione contexto relevante."
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="data">
            <Card>
              <CardHeader>
                <CardTitle>Lista de contatos</CardTitle>
                <CardDescription>
                  Busca com debounce, seleção da página e composição própria no
                  mobile.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-5">
                  <SearchField
                    label="Pesquisar exemplos"
                    value={query}
                    onValueChange={setQuery}
                    onSearch={(value) => {
                      setSearch(value);
                      setPage(1);
                    }}
                    placeholder="Nome da empresa"
                  />
                  <span className="ui-help" role="status">
                    {selected.length} registro(s) selecionado(s)
                  </span>
                  <DataTable
                    caption="Contatos de exemplo"
                    rows={rows.slice((page - 1) * 2, page * 2)}
                    rowKey={(row) => row.id}
                    columns={[
                      {
                        id: "name",
                        header: "Empresa",
                        sortable: true,
                        cell: (row) => row.name,
                      },
                      {
                        id: "stage",
                        header: "Etapa",
                        cell: (row) => (
                          <Badge variant="info">{row.stage}</Badge>
                        ),
                      },
                    ]}
                    sort={sort}
                    onSort={setSort}
                    selected={selected}
                    onSelectionChange={setSelected}
                    renderMobileCard={(row) => (
                      <div className="grid gap-3">
                        <h3 className="ui-card-title">{row.name}</h3>
                        <Badge variant="info">{row.stage}</Badge>
                      </div>
                    )}
                  />
                  <Pagination
                    page={page}
                    pageCount={Math.max(1, Math.ceil(rows.length / 2))}
                    onPageChange={setPage}
                  />
                  <FileUpload
                    label="Selecionar arquivo de exemplo"
                    accept=".csv"
                    maxBytes={5 * 1024 * 1024}
                    onFiles={(files) =>
                      setNotice(
                        `${files.length} arquivo(s) selecionado(s). Nenhum upload foi enviado.`,
                      )
                    }
                  />
                  <p role="status" className="ui-help">
                    {notice}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="states">
            <div className="workspace-home-columns">
              <Card>
                <EmptyState
                  title="Nenhum contato por aqui"
                  description="Comece adicionando o primeiro contato da sua operação."
                  action={
                    <Button
                      size="md"
                      onClick={() =>
                        setNotice("Exemplo de ação em estado vazio.")
                      }
                    >
                      Adicionar contato
                    </Button>
                  }
                />
              </Card>
              <Card>
                <ErrorState
                  requestId="example-request"
                  onRetry={() => setNotice("Tentativa de exemplo concluída.")}
                />
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Estados de integração</CardTitle>
                </CardHeader>
                <CardContent>
                  <FilterBar>
                    {(
                      [
                        "connected",
                        "degraded",
                        "disconnected",
                        "misconfigured",
                        "not_entitled",
                        "disabled",
                        "unknown",
                      ] as const
                    ).map((state) => (
                      <IntegrationStatusBadge key={state} state={state} />
                    ))}
                  </FilterBar>
                  <LastCheckedLabel checkedAt={null} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Carregamento e progresso</CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className="grid gap-4"
                    aria-label="Exemplos de carregamento"
                  >
                    <Skeleton className="h-8 w-2/3" />
                    <Skeleton className="h-20" />
                    <Progress label="Progresso de exemplo" value={60} />
                    <Progress label="Processamento sem percentual disponível" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </PageContainer>
    </DashboardShell>
  );
}
